import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/service";
import {
  verifyCallbackSignature,
  decodeCallbackData,
  executePay,
} from "@/lib/epoint";

// This route serves two very different purposes depending on the method:
//
// GET  — the customer's BROWSER lands here after e-Point redirects them
//        back from the bank page. This carries our own ?paymentId= query
//        param (which we control), but nothing cryptographically verified
//        from e-Point itself. Treat this as UX-only — never update payment
//        status based on this alone.
//
// POST — e-Point's SERVER calls this directly with a signed data+signature
//        payload. This is the only trustworthy source of truth.

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("paymentId");
  if (!paymentId) {
    return NextResponse.redirect(
      new URL("/pricing?error=missing_payment", req.url),
    );
  }

  // Just send the user somewhere sensible. The actual status update already
  // happened (or will happen) via the POST webhook below — we don't trust
  // or act on anything from this GET beyond routing the browser.
  const supabase = createClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("status")
    .eq("id", paymentId)
    .single();

  if (payment?.status === "paid") {
    return NextResponse.redirect(new URL("/courses?success=1", req.url));
  }

  return NextResponse.redirect(
    new URL(`/pricing?paymentId=${paymentId}&pending=1`, req.url),
  );
}

export async function POST(req: NextRequest) {
  const supabase = createClient();

  try {
    const formData = await req.formData();
    const data = formData.get("data") as string;
    const signature = formData.get("signature") as string;

    if (!data || !signature || !verifyCallbackSignature(data, signature)) {
      console.error("e-Point callback: invalid or missing signature");
      return NextResponse.json({ status: "error" }, { status: 400 });
    }

    const payload = decodeCallbackData(data);
    const { order_id, status, operation_code, card_id, amount } = payload;

    // operation_code: "001" = card registration, "100" = customer payment
    if (operation_code === "001") {
      // TODO — UNVERIFIED, confirm tomorrow: order_id may genuinely be null
      // here since Register Card's documented request has no order_id field
      // to echo back. If it IS null in practice, we have no way to know
      // which pending `payments` row this registration belongs to, and this
      // whole branch needs a different correlation strategy (e.g. e-Point
      // may support a custom reference field we haven't seen documented,
      // or card_id may need to be matched via a short-lived server-side
      // session instead of the stateless webhook).
      if (!order_id) {
        console.error(
          "Card registration callback has no order_id — cannot correlate to a payment row",
          payload,
        );
        return NextResponse.json(
          { status: "error", message: "no order_id" },
          { status: 200 },
        );
      }

      const paymentId = Number(order_id);
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .single();

      if (!payment) {
        console.error("Card registration callback: payment not found", {
          paymentId,
        });
        return NextResponse.json({ status: "success" }); // ack receipt either way
      }

      // Only proceed if payment is still pending - prevent replay charges and status regression
      if (payment.status !== "pending") {
        console.log("Card registration callback: payment already processed", {
          paymentId,
          status: payment.status,
        });
        return NextResponse.json({ status: "success" }); // ack receipt either way
      }

      if (status !== "success" || !card_id) {
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", paymentId);
        return NextResponse.json({ status: "success" }); // ack receipt either way
      }

      // Card confirmed — save it, then immediately charge for the first period.
      await supabase
        .from("profiles")
        .update({ card_id, auto_renew: true })
        .eq("id", payment.user_id);

      let chargeResult;
      try {
        chargeResult = await executePay({
          cardId: card_id,
          orderId: String(payment.id),
          amount: Number(payment.amount),
          description: "Info Academy subscription — first charge",
        });
      } catch (chargeError) {
        console.error(
          "executePay failed during card registration callback:",
          chargeError,
        );
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", payment.id);
        // Mark as failed and continue - preserve existing failure response behavior
        return NextResponse.json({ status: "success" }); // ack receipt after marking as failed
      }

      if (chargeResult.status === "success") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_expires_at")
          .eq("id", payment.user_id)
          .single();

        const base =
          profile?.subscription_expires_at &&
          new Date(profile.subscription_expires_at) > new Date()
            ? new Date(profile.subscription_expires_at)
            : new Date();
        base.setMonth(base.getMonth() + payment.plan_months);

        await supabase
          .from("profiles")
          .update({
            is_subscribed: true,
            subscription_expires_at: base.toISOString(),
          })
          .eq("id", payment.user_id);

        await supabase
          .from("payments")
          .update({ status: "paid" })
          .eq("id", payment.id);
      } else {
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", payment.id);
      }

      return NextResponse.json({ status: "success" });
    }

    if (operation_code === "100") {
      // Direct payment confirmation (not currently used in our flow, since
      // we go through card-registration-then-charge, but handling it keeps
      // this route correct if that changes later).
      if (order_id) {
        const paymentId = Number(order_id);
        const { data: payment } = await supabase
          .from("payments")
          .select("status")
          .eq("id", paymentId)
          .single();

        // Only update if payment is still pending - prevent replay charges and status regression
        if (payment && payment.status === "pending") {
          await supabase
            .from("payments")
            .update({ status: status === "success" ? "paid" : "failed" })
            .eq("id", paymentId);
        }
      }
      return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ status: "success" }); // unrecognized operation_code, ack anyway
  } catch (error) {
    console.error("e-Point callback processing error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
