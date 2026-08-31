import { createClient } from "npm:@supabase/supabase-js@2";

const EPOINT_BASE_URL = Deno.env.get("EPOINT_BASE_URL")!;
const EPOINT_PUBLIC_KEY = Deno.env.get("EPOINT_PUBLIC_KEY")!;
const EPOINT_PRIVATE_KEY = Deno.env.get("EPOINT_PRIVATE_KEY")!;

// TODO — same unverified endpoint path issue as lib/epoint.ts.
// Confirm the real path against your dashboard/PHP SDK tomorrow.
const EXECUTE_PAY_PATH = "/execute-pay"; // placeholder

function signPayload(payload: Record<string, unknown>) {
  const json = JSON.stringify(payload);
  const data = btoa(json);
  const sgnString = EPOINT_PRIVATE_KEY + data + EPOINT_PRIVATE_KEY;
  // Deno has no built-in sha1+base64 one-liner — use the Web Crypto API
  return { data, sgnString };
}

async function sha1Base64(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-1", encoder.encode(input));
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

async function executePay(params: {
  cardId: string;
  orderId: string;
  amount: number;
  description?: string;
}) {
  const payload = {
    public_key: EPOINT_PUBLIC_KEY,
    language: "az",
    card_id: params.cardId,
    order_id: params.orderId,
    amount: params.amount,
    currency: "AZN",
    description: params.description,
  };

  const { data, sgnString } = signPayload(payload);
  const signature = await sha1Base64(sgnString);

  const res = await fetch(`${EPOINT_BASE_URL}${EXECUTE_PAY_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data, signature }).toString(),
  });

  const json = await res.json();

  if (json.status === "error" || json.status === "failed") {
    throw new Error(json.message || `e-Point request failed: ${res.status}`);
  }

  return json;
}

Deno.serve(async (req: Request) => {
  // Authorization check - require expected service-role bearer token or shared secret
  // This function should also be configured with verify_jwt = true for scheduled invocations
  const authHeader = req.headers.get("Authorization");
  const expectedSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!authHeader || !expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const token = authHeader.replace("Bearer ", "");
  if (token !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: due, error } = await supabase.rpc("get_due_renewals");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  const results = [];

  for (const row of due ?? []) {
    let newPayment: { id: number } | null = null;
    try {
      // First, insert a new payments row so we have an order_id to charge against —
      // same pattern as create-order/route.ts, since e-Point identifies orders by
      // whatever id we generate, not one it hands back.
      const { data: paymentData, error: insertError } = await supabase
        .from("payments")
        .insert({
          user_id: row.user_id,
          amount: row.amount,
          plan_months: row.plan_months,
          status: "pending",
        })
        .select()
        .single();

      if (insertError || !paymentData) {
        throw new Error(
          insertError?.message || "Failed to create renewal payment row",
        );
      }

      newPayment = paymentData;

      let chargeResult;
      try {
        chargeResult = await executePay({
          cardId: row.card_id,
          orderId: String(newPayment!.id),
          amount: row.amount,
          description: "Info Academy auto-renew",
        });
      } catch (chargeError) {
        console.error("executePay failed during auto-renewal:", chargeError);
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", newPayment!.id);
        // Payment is marked as failed, fall through to catch block for attempt counting
        throw chargeError;
      }

      if (chargeResult.status !== "success") {
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", newPayment!.id);
        throw new Error(
          chargeResult.message || "Charge did not return success",
        );
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_expires_at, renewal_attempt_count")
        .eq("id", row.user_id)
        .single();

      const base =
        profile?.subscription_expires_at &&
        new Date(profile.subscription_expires_at) > new Date()
          ? new Date(profile.subscription_expires_at)
          : new Date();
      base.setMonth(base.getMonth() + row.plan_months);

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          is_subscribed: true,
          subscription_expires_at: base.toISOString(),
          renewal_attempt_count: 0,
        })
        .eq("id", row.user_id);

      if (profileUpdateError) {
        // Charge succeeded but profile write failed - disable auto_renew and record charged-but-not-applied state
        console.error(
          "Profile update failed after successful charge:",
          profileUpdateError,
        );
        await supabase
          .from("profiles")
          .update({
            auto_renew: false,
            renewal_attempt_count: (profile?.renewal_attempt_count ?? 0) + 1,
          })
          .eq("id", row.user_id);
        // Do not mark payment as paid - leave it pending so it can be reviewed
        results.push({
          user_id: row.user_id,
          status: "charge_success_profile_failed",
          error: profileUpdateError.message,
        });
        continue; // Stop processing this profile so it cannot be selected for another renewal attempt
      }

      await supabase
        .from("payments")
        .update({ status: "paid" })
        .eq("id", newPayment!.id);

      results.push({ user_id: row.user_id, status: "renewed" });
    } catch (err) {
      // This catch block handles errors from executePay (payment already marked as failed in try block)
      // and other unexpected errors (payment will be marked as failed here)
      const error = err as Error;
      const isExecutePayError = error.message.includes(
        "executePay failed during auto-renewal",
      );

      if (newPayment && !isExecutePayError) {
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", newPayment.id);
      } else if (!newPayment) {
        // Payment insert failed, skip payment update
        console.error(
          "Payment insert failed, cannot mark as failed:",
          error.message,
        );
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("renewal_attempt_count, auto_renew")
        .eq("id", row.user_id)
        .single();

      const attempts = (profile?.renewal_attempt_count ?? 0) + 1;

      if (attempts >= 3) {
        await supabase
          .from("profiles")
          .update({ auto_renew: false, renewal_attempt_count: attempts })
          .eq("id", row.user_id);
        results.push({
          user_id: row.user_id,
          status: "failed_final",
          attempts,
          error: error.message,
        });
      } else {
        await supabase
          .from("profiles")
          .update({ renewal_attempt_count: attempts })
          .eq("id", row.user_id);
        results.push({
          user_id: row.user_id,
          status: "failed_retry",
          attempts,
          error: error.message,
        });
      }
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    status: 200,
  });
});
