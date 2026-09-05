import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/utils/supabase/service";
import {
  getOrderInfo,
  isPaymentSuccessful,
  isPaymentTerminalFailure,
} from "@/lib/payriff";

// This route serves two very different purposes depending on the method:
//
// GET  — the customer's BROWSER lands here after Payriff redirects them
//        back from the payment page (approveURL/cancelURL/declineURL).
//        This is UX-only — never update payment status based on this alone.
//
// POST — Payriff's SERVER calls this with the callbackUrl we registered on
//        the order. IMPORTANT: the exact payload shape Payriff sends here
//        was not confirmed in the docs we had — only createOrder/autoPay/
//        getOrderInfo response shapes were documented. To stay safe, we
//        only use the incoming body to find the orderId, then call
//        getOrderInfo() to fetch the verified status directly from
//        Payriff's API rather than trusting the callback body's fields.
//        CONFIRM the actual field name carrying orderId in a real sandbox
//        callback before relying on this in production — see TODO below.

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("paymentId");
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  // If no paymentId provided, try to find the most recent pending payment for the authenticated user
  let payment;
  if (!paymentId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: recentPayment } = await supabase
        .from("payments")
        .select("id, status, payriff_order_id, user_id, plan_months")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (recentPayment) {
        payment = recentPayment;
      }
    }

    if (!payment) {
      return NextResponse.redirect(
        new URL("/pricing?error=missing_payment", req.url),
      );
    }
  } else {
    // If paymentId is provided, use it
    const { data: paymentData } = await serviceClient
      .from("payments")
      .select("id, status, payriff_order_id, user_id, plan_months")
      .eq("id", paymentId)
      .single();

    payment = paymentData;
  }

  if (payment?.status === "paid") {
    return NextResponse.redirect(new URL("/courses?success=1", req.url));
  }

  // If payment is still pending, try to check status with Payriff
  if (payment?.status === "pending" && payment?.payriff_order_id) {
    try {
      const orderInfo = await getOrderInfo(payment.payriff_order_id);

      if (isPaymentSuccessful(orderInfo.paymentStatus)) {
        // Payment was successful - grant subscription
        const cardUuid = orderInfo.transactions?.[0]?.cardDetails?.uuid ?? null;
        const transactionId = orderInfo.transactions?.[0]?.uuid ?? null;

        const { error: rpcError } = await serviceClient.rpc(
          "grant_subscription_and_mark_paid",
          {
            p_user_id: payment.user_id,
            p_payment_id: payment.id,
            p_plan_months: payment.plan_months,
            p_card_uuid: cardUuid,
            p_transaction_id: transactionId,
          },
        );

        if (!rpcError) {
          return NextResponse.redirect(new URL("/courses?success=1", req.url));
        } else {
          console.error("Failed to update payment to paid:", rpcError);
        }
      } else if (isPaymentTerminalFailure(orderInfo.paymentStatus)) {
        // Payment failed - mark as failed
        await serviceClient
          .from("payments")
          .update({ status: "failed" })
          .eq("id", payment.id);
        return NextResponse.redirect(
          new URL("/pricing?error=payment_failed", req.url),
        );
      }
    } catch (error) {
      console.error("Failed to check payment status in GET callback:", error);
    }
  }

  return NextResponse.redirect(
    new URL(`/pricing?paymentId=${paymentId}&pending=1`, req.url),
  );
}

export async function POST(req: NextRequest) {
  const serviceClient = createServiceClient();

  try {
    const body = await req.json();

    // Try multiple possible orderId locations
    const orderId: string | undefined =
      body?.orderId ??
      body?.payload?.orderId ??
      body?.sessionId ??
      body?.payload?.sessionId;

    if (!orderId) {
      return NextResponse.json(
        { status: "error", message: "Invalid payload" },
        { status: 400 },
      );
    }

    let { data: payment } = await serviceClient
      .from("payments")
      .select("*")
      .eq("payriff_order_id", orderId)
      .single();

    if (!payment && body?.payload?.sessionId) {
      const { data: paymentBySession } = await serviceClient
        .from("payments")
        .select("*")
        .eq("payriff_order_id", body.payload.sessionId)
        .single();

      if (paymentBySession) {
        payment = paymentBySession;
      }
    }

    if (!payment) {
      return NextResponse.json({ status: "success" }); // ack receipt either way
    }

    // Only proceed if payment is still pending - prevent replay charges and status regression
    if (payment.status !== "pending") {
      return NextResponse.json({ status: "success" }); // ack receipt either way
    }

    let orderInfo;
    try {
      orderInfo = await getOrderInfo(orderId);
    } catch (fetchError) {
      console.error("Payriff callback: getOrderInfo failed", fetchError);
      return NextResponse.json({ status: "error" }, { status: 500 });
    }

    // Handle different payment statuses
    if (!isPaymentSuccessful(orderInfo.paymentStatus)) {
      if (isPaymentTerminalFailure(orderInfo.paymentStatus)) {
        await serviceClient
          .from("payments")
          .update({
            status: "failed",
            payriff_transaction_id: orderInfo.transactions?.[0]?.uuid ?? null,
          })
          .eq("id", payment.id);
        return NextResponse.json({ status: "success" }); // ack receipt either way
      } else {
        return NextResponse.json({ status: "success" });
      }
    }

    const cardUuid = orderInfo.transactions?.[0]?.cardDetails?.uuid ?? null;
    const transactionId = orderInfo.transactions?.[0]?.uuid ?? null;

    // Use atomic Postgres function to grant subscription and mark payment as paid
    const { error: rpcError } = await serviceClient.rpc(
      "grant_subscription_and_mark_paid",
      {
        p_user_id: payment.user_id,
        p_payment_id: payment.id,
        p_plan_months: payment.plan_months,
        p_card_uuid: cardUuid,
        p_transaction_id: transactionId,
      },
    );

    if (rpcError) {
      console.error("Payriff callback: atomic update failed", rpcError);
      return NextResponse.json({ status: "error" }, { status: 500 });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Payriff callback processing error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
