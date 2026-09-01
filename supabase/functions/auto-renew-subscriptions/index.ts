import { createClient } from "npm:@supabase/supabase-js@2";

const PAYRIFF_BASE_URL = "https://api.payriff.com";
const PAYRIFF_SECRET_KEY = Deno.env.get("PAYRIFF_SECRET_KEY")!;
const RENEWAL_CALLBACK_URL = Deno.env.get("PAYRIFF_RENEWAL_CALLBACK_URL")!;

type AutoPayPayload = {
  orderId: string;
  paymentStatus: string;
  transactions: Array<{
    uuid: string;
    status: string;
  }>;
};

type PayriffResponse<T> = {
  code: string;
  message: string;
  internalMessage?: string | null;
  payload: T;
};

function isPaymentSuccessful(paymentStatus: string): boolean {
  return (
    paymentStatus === "APPROVED" ||
    paymentStatus === "ACCEPTED" ||
    paymentStatus === "PAID" ||
    paymentStatus === "COMPLETED"
  );
}

async function autoPay(params: {
  cardUuid: string;
  amount: number;
  description: string;
  orderId: string;
}): Promise<AutoPayPayload> {
  const res = await fetch(`${PAYRIFF_BASE_URL}/api/v3/autoPay`, {
    method: "POST",
    signal: AbortSignal.timeout(30_000),
    headers: {
      Authorization: PAYRIFF_SECRET_KEY, // no "Bearer " prefix
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cardUuid: params.cardUuid,
      amount: params.amount,
      currency: "AZN",
      description: params.description,
      callbackUrl: RENEWAL_CALLBACK_URL,
      operation: "PURCHASE",
      orderId: params.orderId,
    }),
  });

  const json = (await res.json()) as PayriffResponse<AutoPayPayload>;

  // Per Payriff docs: code/message only confirm the API call was processed,
  // NOT that the payment succeeded — that's payload.paymentStatus, checked separately below.
  if (json.code !== "00000" && json.code !== "01000") {
    throw new Error(json.message || `Payriff autoPay request failed: ${res.status}`);
  }

  return json.payload;
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

    // Mark the attempt timestamp immediately so a re-run today (manual trigger,
    // cron overlap) doesn't double-select this profile — get_due_renewals()
    // filters on last_renewal_attempt_at < current_date.
    const { error: attemptError } = await supabase
      .from("profiles")
      .update({ last_renewal_attempt_at: new Date().toISOString() })
      .eq("id", row.user_id);

      if (attemptError) {
        console.error("Failed to record renewal attempt:", attemptError);
        results.push({ user_id: row.user_id, status: "attempt_record_failed" });
        continue;
      }

    try {
      // Insert a pending payments row first so we have an order_id to charge against.
      const { data: paymentData, error: insertError } = await supabase
        .from("payments")
        .insert({
          user_id: row.user_id,
          amount: row.amount,
          plan_months: row.plan_months,
          status: "pending",
          is_renewal: true,
        })
        .select()
        .single();

      if (insertError || !paymentData) {
        throw new Error(
          insertError?.message || "Failed to create renewal payment row",
        );
      }

      newPayment = paymentData;

      let chargeResult: AutoPayPayload;
      try {
        chargeResult = await autoPay({
          cardUuid: row.card_uuid,
          orderId: String(newPayment!.id),
          amount: row.amount,
          description: "Info Academy auto-renew",
        });
      } catch (chargeError) {
        console.error("autoPay failed during auto-renewal:", chargeError);
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", newPayment!.id);
        // Payment is marked as failed, fall through to catch block for attempt counting
        throw new Error(`executePay failed during auto-renewal: ${(chargeError as Error).message}`);
      }

      if (!isPaymentSuccessful(chargeResult.paymentStatus)) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            payriff_order_id: chargeResult.orderId,
            payriff_transaction_id: chargeResult.transactions?.[0]?.uuid ?? null,
          })
          .eq("id", newPayment!.id);
        throw new Error(
          `Charge did not succeed — paymentStatus: ${chargeResult.paymentStatus}`,
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
        .update({
          status: "paid",
          payriff_order_id: chargeResult.orderId,
          payriff_transaction_id: chargeResult.transactions?.[0]?.uuid ?? null,
        })
        .eq("id", newPayment!.id);

      results.push({ user_id: row.user_id, status: "renewed" });
    } catch (err) {
      // This catch block handles errors from autoPay (payment already marked as failed in try block)
      // and other unexpected errors (payment will be marked as failed here)
      const error = err as Error;
      const isAutoPayError = error.message.includes(
        "executePay failed during auto-renewal",
      );

      if (newPayment && !isAutoPayError) {
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