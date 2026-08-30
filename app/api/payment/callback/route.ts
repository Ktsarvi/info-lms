import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/service"; // service-role client (no user session here)
import { getOrderDetails } from "@/lib/kapital-bank";

async function handleCallback(req: NextRequest) {
  const idParam =
    req.nextUrl.searchParams.get("ID") ||
    req.nextUrl.searchParams.get("id") ||
    req.nextUrl.searchParams.get("orderId") ||
    req.nextUrl.searchParams.get("ORDER_ID");

  const orderId = Number(idParam);
  if (!orderId)
    return NextResponse.redirect(
      new URL("/pricing?error=missing_order", req.url),
    );

  const supabase = createClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("kapital_order_id", orderId)
    .single();

  if (!payment)
    return NextResponse.redirect(
      new URL("/pricing?error=unknown_order", req.url),
    );

  try {
    const { order } = await getOrderDetails(orderId, { tokenDetailLevel: 2 });

    if (order?.status === "FullyPaid" || order?.status === "Approved") {
      // Atomically claim the payment by updating status only if still pending
      const { data: updatedPayment, error: claimError } = await supabase
        .from("payments")
        .update({ status: "paid" })
        .eq("kapital_order_id", orderId)
        .eq("status", "pending")
        .select()
        .single();

      if (claimError || !updatedPayment) {
        // Payment was already processed or failed to claim
        console.error("Payment claim error:", claimError);
        return NextResponse.redirect(new URL("/pricing?error=failed", req.url));
      }

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

      const storedTokenId = order.storedTokens?.[0]?.id ?? null;

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          is_subscribed: true,
          subscription_expires_at: base.toISOString(),
          ...(storedTokenId
            ? { stored_token_id: storedTokenId, auto_renew: true }
            : {}),
        })
        .eq("id", payment.user_id);

      if (profileUpdateError) {
        console.error("Profile update error:", profileUpdateError);
        return NextResponse.redirect(new URL("/pricing?error=failed", req.url));
      }

      return NextResponse.redirect(new URL("/courses?success=1", req.url));
    }

    await supabase
      .from("payments")
      .update({ status: "failed" })
      .eq("kapital_order_id", orderId);
    return NextResponse.redirect(new URL("/pricing?error=declined", req.url));
  } catch (error) {
    console.error("Payment callback processing error:", error);
    return NextResponse.redirect(new URL("/pricing?error=failed", req.url));
  }
}

export async function GET(req: NextRequest) {
  return handleCallback(req);
}

export async function POST(req: NextRequest) {
  return handleCallback(req);
}
