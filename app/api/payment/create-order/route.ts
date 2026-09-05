import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/utils/supabase/service";
import { createOrder } from "@/lib/payriff";
import {
  termsContent,
  privacyContent,
} from "@/components/homepage/legal-content";

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

    // --- Consent validation ---
    const consent = body?.consent;
    if (
      !consent ||
      consent.termsRevision !== termsContent.revision ||
      consent.privacyRevision !== privacyContent.revision
    ) {
      return NextResponse.json({ error: "Consent required" }, { status: 400 });
    }

    // Privileged server-only client for financial state writes
    const serviceClient = createServiceClient();

    // Insert a pending payment row first. Unlike e-Point's Register Card
    // step, Payriff's createOrder call itself returns its own orderId —
    // we'll write that back onto this row right after the call below, so
    // the callback route can correlate by payriff_order_id.
    const { data: payment, error: dbError } = await serviceClient
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

    // --- Persist consent before calling payment gateway ---
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const { error: consentError } = await serviceClient
      .from("payment_consents")
      .insert({
        user_id: user.id,
        payment_id: payment.id,
        terms_revision: consent.termsRevision,
        privacy_revision: consent.privacyRevision,
        ip_address: clientIp,
      });

    if (consentError) {
      console.error("Failed to record consent:", consentError);
      await serviceClient
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id);
      return NextResponse.json(
        { error: "Failed to record consent" },
        { status: 500 },
      );
    }

    const callbackUrl = process.env.PAYRIFF_CALLBACK_URL;
    if (!callbackUrl) {
      console.error("PAYRIFF_CALLBACK_URL is not configured");
      await serviceClient
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
        cardSave: false, // Disabled since autopay is not enabled for this merchant account
        operation: "PURCHASE",
        language: "AZ",
        currency: "AZN",
      });
    } catch (orderError) {
      console.error("Payriff createOrder failed:", orderError);
      await serviceClient
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
    const { error: updateError } = await serviceClient
      .from("payments")
      .update({ payriff_order_id: orderResult.orderId })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Failed to store payriff_order_id:", updateError);
      await serviceClient
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id);
      return NextResponse.json(
        { error: "Failed to initialize payment. Please try again." },
        { status: 500 },
      );
    }

    if (!orderResult.paymentUrl) {
      console.error("No paymentUrl in Payriff response");
      await serviceClient
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
    return NextResponse.json(
      { error: "Не удалось создать заказ на оплату. Попробуйте позже." },
      { status: 500 },
    );
  }
}
