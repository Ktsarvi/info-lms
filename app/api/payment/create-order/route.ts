import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/utils/supabase/service";
import { createOrder } from "@/lib/payriff";
import {
  termsContent,
  privacyContent,
} from "@/components/homepage/legal-content";

const DURATION_CONFIG: Record<string, { months: number; amount: number }> = {
  "weekly": { months: 0.25, amount: 10.0 },
  "monthly": { months: 1, amount: 25.0 },
  "9month": { months: 9, amount: 150.0 },
  "yearly": { months: 12, amount: 220.0 },
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
    
    // Support both old plan format and new duration/periods format
    let totalMonths: number;
    let amount: number;
    let durationType: string;
    let periods: number;

    if (body?.duration && body?.periods !== undefined) {
      // New format with duration and periods
      durationType = body.duration;
      periods = body.periods;
      const config = DURATION_CONFIG[durationType];
      if (!config) {
        return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
      }
      totalMonths = body.totalMonths || config.months * periods;
      amount = body.amount || config.amount * periods;
    } else {
      // Legacy format for backward compatibility
      const plan = body?.plan || "1m";
      const selected = DURATION_CONFIG[plan === "1m" ? "monthly" : plan === "6m" ? "9month" : "monthly"];
      if (!selected) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
      durationType = "monthly";
      periods = 1;
      totalMonths = selected.months;
      amount = selected.amount;
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

    // Get user's phone number for 1Click checkout
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .single();

    // Insert a pending payment row first. Unlike e-Point's Register Card
    // step, Payriff's createOrder call itself returns its own orderId —
    // we'll write that back onto this row right after the call below, so
    // the callback route can correlate by payriff_order_id.
    const { data: payment, error: dbError } = await serviceClient
      .from("payments")
      .insert({
        user_id: user.id,
        amount: amount,
        plan_months: totalMonths,
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
        amount: amount,
        description: `Info Academy subscription (${durationType} x${periods})`,
        callbackUrl,
        cardSave: false, // TODO: Enable after Payriff enables autopay for merchant account (ticket 013434)
        operation: "PURCHASE",
        language: "AZ",
        currency: "AZN",
        phone: profile?.phone || undefined,
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

    // Store user's last selected duration and periods
    await serviceClient
      .from("profiles")
      .update({
        last_duration_type: durationType,
        last_periods: periods,
      })
      .eq("id", user.id);

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
