import { createClient } from "npm:@supabase/supabase-js@2";

const PAYRIFF_SECRET_KEY = Deno.env.get("PAYRIFF_SECRET_KEY")!;
const PAYRIFF_MERCHANT_ID = Deno.env.get("PAYRIFF_MERCHANT_ID")!;
const PAYRIFF_BASE_URL = "https://api.payriff.com";

// Payriff error class for better error handling
class PayriffError extends Error {
  code: string;
  internalMessage: string | null;

  constructor(code: string, message: string, internalMessage: string | null) {
    super(`Payriff error ${code}: ${message}`);
    this.code = code;
    this.internalMessage = internalMessage;
    this.name = "PayriffError";
  }
}

// Unified Payriff request function with proper error handling and logging
async function payriffRequest<T>(
  version: "v2" | "v3",
  method: string,
  body: Record<string, unknown>,
  httpMethod: "POST" | "GET" | "DELETE" = "POST",
): Promise<{ code: string; message: string; payload: T }> {
  const url = `${PAYRIFF_BASE_URL}/api/${version}/${method}`;

  console.log(`Payriff request: ${httpMethod} ${url}`);
  console.log(`Request body:`, JSON.stringify(body, null, 2));

  const res = await fetch(url, {
    method: httpMethod,
    headers: {
      Authorization: PAYRIFF_SECRET_KEY,
      "Content-Type": "application/json",
    },
    body: httpMethod === "GET" ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });

  const text = await res.text();
  console.log(`Payriff response status: ${res.status}`);
  console.log(`Response body:`, text.slice(0, 500));

  let data: { code: string; message: string; payload: T };
  try {
    data = JSON.parse(text) as { code: string; message: string; payload: T };
  } catch {
    throw new PayriffError(
      String(res.status),
      `Payriff returned a non-JSON response (HTTP ${res.status})`,
      text.slice(0, 500),
    );
  }

  console.log(`Payriff parsed response:`, {
    code: data.code,
    message: data.message,
  });

  if (data.code !== "00000") {
    throw new PayriffError(
      data.code,
      data.message,
      null,
    );
  }

  return data;
}

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

function toPayriffPhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
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
  
  try {
    const data = await payriffRequest<{ id: number; paymentUrl: string; invoiceUuid: string }>(
      "v2",
      "invoices",
      {
        merchant: PAYRIFF_MERCHANT_ID,
        body: {
          amount: amount,
          fullName: user.full_name || "Customer",
          email: user.email,
          phoneNumber: toPayriffPhone(user.phone),
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
      }
    );

    console.log(`Invoice created successfully for user ${user.user_id}:`, data.payload);
    return { ok: true as const, data: data.payload };
  } catch (error) {
    console.error(`Failed to create invoice for user ${user.user_id}:`, error);
    if (error instanceof PayriffError) {
      return {
        ok: false as const,
        error: `${error.code}: ${error.message}`,
      };
    }
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function isServiceRoleRequest(
  authHeader: string | null,
  expectedSecret: string | undefined,
): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  if (expectedSecret && token === expectedSecret) return true;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(padded));
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  const expectedSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!isServiceRoleRequest(authHeader, expectedSecret)) {
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
      if (!user.phone) {
        await supabase.from("notification_logs").insert({
          user_id: user.user_id,
          type: "invoice",
          template: "subscription_expiring",
          status: "failed",
          error_message: "Missing profiles.phone",
        });
        results.push({ user_id: user.user_id, status: "failed", error: "Missing profiles.phone" });
        continue;
      }

      const invoiceCreated = await createRenewalInvoice(user);

      await supabase.from("notification_logs").insert({
        user_id: user.user_id,
        type: "invoice",
        template: "subscription_expiring",
        status: invoiceCreated.ok ? "sent" : "failed",
        error_message: invoiceCreated.ok ? null : invoiceCreated.error,
      });

      results.push({
        user_id: user.user_id,
        status: invoiceCreated.ok ? "sent" : "failed",
        error: invoiceCreated.ok ? null : invoiceCreated.error,
        invoice_data: invoiceCreated.ok ? invoiceCreated.data : null,
      });
    } catch (err) {
      console.error("Failed to create invoice:", err);
      
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      
      await supabase.from("notification_logs").insert({
        user_id: user.user_id,
        type: "invoice",
        template: "subscription_expiring",
        status: "failed",
        error_message: errorMessage,
      });
      
      results.push({ user_id: user.user_id, status: "error", error: errorMessage });
    }
  }

  return new Response(JSON.stringify({ 
    processed: results.length, 
    results,
    summary: {
      total: results.length,
      sent: results.filter(r => r.status === "sent").length,
      failed: results.filter(r => r.status === "failed" || r.status === "error").length
    }
  }), { status: 200 });
});
