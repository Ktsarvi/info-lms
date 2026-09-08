import { createClient } from "npm:@supabase/supabase-js@2";

const PAYRIFF_SECRET_KEY = Deno.env.get("PAYRIFF_SECRET_KEY")!;
const PAYRIFF_MERCHANT_ID = Deno.env.get("PAYRIFF_MERCHANT_ID")!;
const PAYRIFF_BASE_URL = "https://api.payriff.com";

interface ExpiringUser {
  user_id: string;
  email: string;
  phone: string;
  full_name: string;
  subscription_expires_at: string;
  days_until_expiry: number;
  last_duration_type: string | null;
  last_periods: number | null;
}

async function createRenewalInvoice(user: ExpiringUser) {
  const expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const appUrl = Deno.env.get("NEXT_PUBLIC_APP_URL") || "https://infoacademy.netlify.app";
  
  // Calculate amount based on user's last selected duration and periods
  const durationConfig: Record<string, { amount: number; label: string }> = {
    "weekly": { amount: 10, label: "недельный" },
    "monthly": { amount: 25, label: "месячный" },
    "9month": { amount: 150, label: "9 месяцев" },
    "yearly": { amount: 220, label: "годовой" },
  };
  
  const lastDuration = user.last_duration_type || "monthly";
  const lastPeriods = user.last_periods || 1;
  const config = durationConfig[lastDuration];
  const amount = config.amount * lastPeriods;
  const durationLabel = lastPeriods > 1 
    ? `${lastPeriods} ${lastPeriods === 1 ? 'период' : lastPeriods < 5 ? 'периода' : 'периодов'} (${config.label})`
    : config.label;
  
  const res = await fetch(`${PAYRIFF_BASE_URL}/api/v2/invoices`, {
    method: "POST",
    headers: {
      Authorization: PAYRIFF_SECRET_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchant: PAYRIFF_MERCHANT_ID,
      body: {
        amount: amount,
        fullName: user.full_name || "Customer",
        email: user.email,
        phoneNumber: user.phone,
        description: `Info Academy subscription renewal (${durationLabel})`,
        currencyType: "AZN",
        languageType: "AZ",
        expireDate: expireDate.toISOString(),
        approveURL: `${appUrl}/courses?success=1`,
        cancelURL: `${appUrl}/pricing`,
        declineURL: `${appUrl}/pricing?error=payment_failed`,
        sendSms: true,
        sendEmail: true,
        directPay: true,
        customMessage: `Ваша подписка истекает через ${user.days_until_expiry} ${user.days_until_expiry === 1 ? 'день' : user.days_until_expiry < 5 ? 'дня' : 'дней'}. Продлите: ${durationLabel} за ${amount}₼`,
      },
    }),
  });

  const data = await res.json();
  return data.code === "00000";
}

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  const expectedSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!authHeader || authHeader.replace("Bearer ", "") !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: expiringUsers, error } = await supabase.rpc(
    "get_expiring_subscriptions",
    { days_threshold: 7 }
  );

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const results = [];

  for (const user of (expiringUsers as ExpiringUser[]) ?? []) {
    try {
      const invoiceCreated = await createRenewalInvoice(user);

      await supabase.from("notification_logs").insert({
        user_id: user.user_id,
        type: "invoice",
        template: "subscription_expiring",
        status: invoiceCreated ? "sent" : "failed",
        error_message: invoiceCreated ? null : "Invoice creation failed",
      });

      results.push({ user_id: user.user_id, status: invoiceCreated ? "sent" : "failed" });
    } catch (err) {
      console.error("Failed to create invoice:", err);
      
      await supabase.from("notification_logs").insert({
        user_id: user.user_id,
        type: "invoice",
        template: "subscription_expiring",
        status: "failed",
        error_message: err instanceof Error ? err.message : "Unknown error",
      });
      
      results.push({ user_id: user.user_id, status: "error" });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), { status: 200 });
});
