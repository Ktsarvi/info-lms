import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/service";
import { getOrderInfo, isPaymentSuccessful, isPaymentTerminalFailure } from "@/lib/payriff";

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
  if (!paymentId) {
    return NextResponse.redirect(
      new URL("/pricing?error=missing_payment", req.url),
    );
  }

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
    console.log("DEBUG: Payriff callback POST received");
    
    // TODO — UNVERIFIED: confirm the real shape of Payriff's callback body
    // in sandbox. Guessing JSON with an orderId field based on their other
    // endpoints' payload shapes (createOrder/autoPay/getOrderInfo all key
    // off "orderId"). If Payriff sends form-encoded data instead, switch
    // this to req.formData() like the old e-Point route did.
    const body = await req.json();
    console.log("DEBUG: Payriff callback body:", JSON.stringify(body, null, 2));
    
    const orderId: string | undefined = body?.orderId ?? body?.payload?.orderId;
    console.log("DEBUG: Extracted orderId:", orderId);

    if (!orderId) {
      console.error("Payriff callback: no orderId found in payload", body);
      return NextResponse.json({ status: "error", message: "no orderId" }, { status: 400 });
    }

    // Find the payments row by the Payriff orderId we stored when the order
    // was created (in your create-order route — make sure that route writes
    // payriff_order_id immediately after calling createOrder(), since
    // Payriff generates this ID itself rather than accepting one from us).
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("payriff_order_id", orderId)
      .single();

    console.log("DEBUG: Found payment:", payment ? { id: payment.id, status: payment.status } : "null");

    if (!payment) {
      console.error("Payriff callback: payment not found for orderId", { orderId });
      return NextResponse.json({ status: "success" }); // ack receipt either way
    }

    // Only proceed if payment is still pending - prevent replay charges and status regression
    if (payment.status !== "pending") {
      console.log("Payriff callback: payment already processed", {
        paymentId: payment.id,
        status: payment.status,
      });
      return NextResponse.json({ status: "success" }); // ack receipt either way
    }

    // Don't trust the callback body's status fields directly — fetch the
    // verified order status from Payriff's API.
    let orderInfo;
    try {
      orderInfo = await getOrderInfo(orderId);
      console.log("DEBUG: Order info received:", JSON.stringify(orderInfo, null, 2));
    } catch (fetchError) {
      console.error("Payriff callback: getOrderInfo failed", fetchError);
      // Leave payment pending — we couldn't verify, so don't mark it failed
      // or paid based on unverified data. Payriff may retry the callback.
      return NextResponse.json({ status: "error" }, { status: 500 });
    }

    console.log("DEBUG: Payment status check:", { 
      paymentStatus: orderInfo.paymentStatus,
      isSuccessful: isPaymentSuccessful(orderInfo.paymentStatus),
      isTerminalFailure: isPaymentTerminalFailure(orderInfo.paymentStatus)
    });

    if (!isPaymentSuccessful(orderInfo.paymentStatus)) {
      if (!isPaymentTerminalFailure(orderInfo.paymentStatus)) {
        console.warn("Payriff callback: non-final status, leaving pending", {
          paymentId: payment.id,
          paymentStatus: orderInfo.paymentStatus,
        });
        return NextResponse.json({ status: "success" });
      }
      await supabase
        .from("payments")
        .update({
          status: "failed",
          payriff_transaction_id: orderInfo.transactions?.[0]?.uuid ?? null,
        })
        .eq("id", payment.id);
      return NextResponse.json({ status: "success" }); // ack receipt either way
    }

    // Payment succeeded. If this order had cardSave: true, the saved card's
    // uuid comes back on the transaction's cardDetails.
    const cardUuid = orderInfo.transactions?.[0]?.cardDetails?.uuid ?? null;
    const transactionId = orderInfo.transactions?.[0]?.uuid ?? null;

    console.log("DEBUG: Calling atomic function with:", {
      p_user_id: payment.user_id,
      p_payment_id: payment.id,
      p_plan_months: payment.plan_months,
      p_card_uuid: cardUuid,
      p_transaction_id: transactionId,
    });

    // Use atomic Postgres function to grant subscription and mark payment as paid
    const { error: rpcError } = await supabase.rpc("grant_subscription_and_mark_paid", {
      p_user_id: payment.user_id,
      p_payment_id: payment.id,
      p_plan_months: payment.plan_months,
      p_card_uuid: cardUuid,
      p_transaction_id: transactionId,
    });

    if (rpcError) {
      console.error("Payriff callback: atomic update failed", {
        paymentId: payment.id,
        userId: payment.user_id,
        error: rpcError,
      });
      return NextResponse.json({ status: "error" }, { status: 500 });
    }

    console.log("DEBUG: Atomic function succeeded, payment marked as paid");
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Payriff callback processing error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}