import { createClient } from "npm:@supabase/supabase-js@2";

const KAPITAL_BASE_URL = Deno.env.get("KAPITAL_BASE_URL")!;
const KAPITAL_AUTH =
  "Basic " +
  btoa(
    `${Deno.env.get("KAPITAL_USERNAME")}:${Deno.env.get("KAPITAL_PASSWORD")}`,
  );
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

async function kapitalFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${KAPITAL_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: KAPITAL_AUTH,
      ...(init?.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok || data.errorCode) {
    throw new Error(
      data.errorDescription || `Kapital request failed: ${res.status}`,
    );
  }
  return data;
}

Deno.serve(async (req: Request) => {
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${SERVICE_ROLE_KEY}`) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    SERVICE_ROLE_KEY,
  );

  const { data: due, error } = await supabase.rpc("get_due_renewals");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  const results = [];

  for (const row of due ?? []) {
    try {
      const { order } = await kapitalFetch("/order", {
        method: "POST",
        body: JSON.stringify({
          order: {
            typeRid: "Order_REC",
            amount: row.amount,
            currency: "AZN",
            language: "az",
            description: "Info Academy auto-renew",
          },
        }),
      });

      const passwordQuery = encodeURIComponent(order.password);
      await kapitalFetch(
        `/order/${order.id}/set-src-token?password=${passwordQuery}`,
        {
          method: "POST",
          body: JSON.stringify({
            order: { initiationEnvKind: "Server" },
            token: { storedId: row.stored_token_id },
          }),
        },
      );

      await kapitalFetch(`/order/${order.id}/exec-tran`, {
        method: "POST",
        body: JSON.stringify({
          tran: { phase: "Single", conditions: { cofUsage: "Recurring" } },
        }),
      });

      // Verify the payment was successful by checking order status
      const { order: updatedOrder } = await kapitalFetch(
        `/order/${order.id}?tranDetailLevel=2`,
        {
          method: "GET",
        },
      );

      if (
        updatedOrder.status !== "FullyPaid" &&
        updatedOrder.status !== "Approved"
      ) {
        throw new Error(`Payment failed with status: ${updatedOrder.status}`);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_expires_at")
        .eq("id", row.user_id)
        .single();

      const base =
        profile?.subscription_expires_at &&
        new Date(profile.subscription_expires_at) > new Date()
          ? new Date(profile.subscription_expires_at)
          : new Date();
      base.setMonth(base.getMonth() + row.plan_months);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          is_subscribed: true,
          subscription_expires_at: base.toISOString(),
          renewal_attempt_count: 0,
        })
        .eq("id", row.user_id);
      if (profileError) {
        // The card is already charged. Persist durable state before preventing retry.
        const attempts = (row.renewal_attempt_count ?? 0) + 1;
        
        // Disable auto-renew and increment attempts to prevent retry loops
        await supabase
          .from("profiles")
          .update({ auto_renew: false, renewal_attempt_count: attempts })
          .eq("id", row.user_id);
        
        // Create reconciliation record for manual recovery
        await supabase.from("reconciliation_records").insert({
          user_id: row.user_id,
          kapital_order_id: order.id,
          amount: row.amount,
          plan_months: row.plan_months,
          reason: "profile_update_failed_after_charge",
          metadata: { profile_error: profileError.message },
        });
        
        results.push({
          user_id: row.user_id,
          status: "charged_but_not_applied",
          order_id: order.id,
          error: profileError.message,
        });
        continue;
      }

      const { error: paymentError } = await supabase.from("payments").insert({
        kapital_order_id: order.id,
        user_id: row.user_id,
        amount: row.amount,
        plan_months: row.plan_months,
        status: "paid",
      });
      if (paymentError) {
        console.error("Renewal payment insert failed", order.id, paymentError);
        // Profile is renewed but payment record missing - treat as partial
        results.push({
          user_id: row.user_id,
          status: "partial_renewal_payment_pending",
          order_id: order.id,
          error: paymentError.message,
        });
        continue;
      }

      results.push({ user_id: row.user_id, status: "renewed" });
    } catch (err) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("renewal_attempt_count")
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
          error: (err as Error).message,
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
          error: (err as Error).message,
        });
      }
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    status: 200,
  });
});
