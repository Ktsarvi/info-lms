import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createOrder } from "@/lib/payriff";

const PLANS: Record<string, { months: number; amount: number }> = {
  "1m": { months: 1, amount: 20.0 },
  "6m": { months: 6, amount: 100.0 },
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = body?.plan || "1m";
    const selected = PLANS[plan];
    if (!selected) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Insert a pending payment row first. Unlike e-Point's Register Card
    // step, Payriff's createOrder call itself returns its own orderId —
    // we'll write that back onto this row right after the call below, so
    // the callback route can correlate by payriff_order_id.
    const { data: payment, error: dbError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        amount: selected.amount,
        plan_months: selected.months,
        status: "pending",
      })
      .select()
      .single();

    if (dbError || !payment) {
      console.error("Database insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to record payment in database" },
        { status: 500 },
      );
    }

    const callbackUrl = process.env.PAYRIFF_CALLBACK_URL;
    if (!callbackUrl) {
      console.error("PAYRIFF_CALLBACK_URL is not configured");
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id);
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 500 },
      );
    }
    let orderResult;
    try {
      orderResult = await createOrder({
        amount: selected.amount,
        description: `Info Academy subscription (${plan})`,
        callbackUrl,
        cardSave: true, // saves the card as a side effect of this real charge
        operation: "PURCHASE",
        language: "AZ",
        currency: "AZN",
      });
    } catch (orderError) {
      console.error("Payriff createOrder failed:", orderError);
      console.error("Payriff error details:", {
        error: orderError,
        message: orderError instanceof Error ? orderError.message : String(orderError),
        stack: orderError instanceof Error ? orderError.stack : undefined,
      });
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id);
      return NextResponse.json(
        { error: "Payment gateway request failed" },
        { status: 500 },
      );
    }

    // Store Payriff's orderId immediately so the callback route (which
    // correlates by payriff_order_id) can find this row.
    const { error: updateError } = await supabase
      .from("payments")
      .update({ payriff_order_id: orderResult.orderId })
      .eq("id", payment.id);

    if (updateError) {
      // Not fatal to the user's checkout flow, but the callback won't be
      // able to find this row later without it — log loudly.
      console.error(
        "Failed to store payriff_order_id — callback correlation will fail:",
        updateError,
        { paymentId: payment.id, payriffOrderId: orderResult.orderId },
      );
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id);
      return NextResponse.json(
        { error: "Failed to initialize payment. Please try again." },
        { status: 500 },
      );
    }

    if (!orderResult.paymentUrl) {
      console.error("No paymentUrl in Payriff response:", orderResult);
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id);
      return NextResponse.json(
        { error: "Payment gateway did not return a payment URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ redirectUrl: orderResult.paymentUrl });
  } catch (error: unknown) {
    console.error("Create payment error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create payment";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}