import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { registerCard } from "@/lib/epoint";

const PLANS: Record<string, { months: number; amount: string }> = {
  "1m": { months: 1, amount: "20.00" },
  "6m": { months: 6, amount: "100.00" },
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

    // Insert a pending payment row first — its id becomes our own internal
    // reference for this purchase attempt. This matters more than it did
    // with Kapital: e-Point's Register Card request has no order_id field
    // at all (it's pure card registration, no charge yet), so there's
    // nothing from their side to key off of at this step.
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

    // We embed our own payment id in the redirect URLs we control, so we
    // can correlate the browser coming back to us — independent of
    // whatever e-Point sends (or doesn't send) asynchronously for a
    // registration-only event.
    const successUrl = `${process.env.EPOINT_SUCCESS_URL}?paymentId=${payment.id}`;
    const errorUrl = `${process.env.EPOINT_ERROR_URL}?paymentId=${payment.id}`;

    const response = await registerCard({
      language: "az",
      description: `Info Academy subscription (${plan})`,
      successRedirectUrl: successUrl,
      errorRedirectUrl: errorUrl,
    });

    // TODO — UNVERIFIED: e-Point's public docs table for Register Card's
    // response doesn't list a redirect_url field explicitly (unlike
    // Create Payment, which does), even though the descriptive text says
    // the customer gets sent to a bank page to enter card details.
    // Confirm the real field name against an actual response tomorrow —
    // if it's wrong, this whole route will silently 500 on the next check.
    const redirectUrl = response.redirect_url;

    if (!redirectUrl) {
      console.error("No redirect URL in e-Point response:", response);
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id);
      return NextResponse.json(
        { error: "Payment gateway did not return a redirect URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ redirectUrl });
  } catch (error: unknown) {
    console.error("Create payment error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create payment";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
