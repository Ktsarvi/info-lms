const BASE_URL = process.env.EPOINT_BASE_URL!; // e.g. https://epoint.az/api/1 — confirm exact value in your dashboard
const PUBLIC_KEY = process.env.EPOINT_PUBLIC_KEY!;
const PRIVATE_KEY = process.env.EPOINT_PRIVATE_KEY!;
const crypto = require("crypto");

// TODO: confirm these exact paths — e-Point's public docs render them as "***".
// Check the PHP SDK source (composer require rafoabbas/epoint-php, then look at
// its EpointClient class) or your dashboard's code samples for the real values.
const ENDPOINTS = {
  registerCard: "/card-registration", // placeholder
  executePay: "/execute-pay", // placeholder
};

function signPayload(payload: Record<string, unknown>) {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64");
  const sgnString = PRIVATE_KEY + data + PRIVATE_KEY;
  const signature = crypto
    .createHash("sha1")
    .update(sgnString)
    .digest("base64");
  return { data, signature };
}

export function verifyCallbackSignature(data: string, signature: string) {
  const sgnString = PRIVATE_KEY + data + PRIVATE_KEY;
  const expected = crypto.createHash("sha1").update(sgnString).digest("base64");

  // Use constant-time comparison to prevent timing attacks
  // Both values must be compared as equal-length byte sequences
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function decodeCallbackData(data: string) {
  return JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
}

async function epointFetch(path: string, payload: Record<string, unknown>) {
  const { data, signature } = signPayload(payload);

  // Enforce a bounded fetch timeout using AbortController
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data, signature }).toString(),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Check HTTP status before parsing JSON - non-2xx responses produce an error
    if (!res.ok) {
      throw new Error(`e-Point request failed with HTTP status: ${res.status}`);
    }

    const json = await res.json();

    // Preserve existing JSON status error handling for successful responses
    if (json.status === "error" || json.status === "failed") {
      throw new Error(json.message || `e-Point request failed: ${res.status}`);
    }

    return json;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("e-Point request timed out after 30 seconds");
    }
    throw error;
  }
}

export async function registerCard(params: {
  language?: string;
  description?: string;
  successRedirectUrl: string;
  errorRedirectUrl: string;
}) {
  return epointFetch(ENDPOINTS.registerCard, {
    public_key: PUBLIC_KEY,
    language: params.language ?? "az",
    description: params.description,
    success_redirect_url: params.successRedirectUrl,
    error_redirect_url: params.errorRedirectUrl,
  });
}

export async function executePay(params: {
  cardId: string;
  orderId: string;
  amount: number;
  currency?: string;
  language?: string;
  description?: string;
}) {
  return epointFetch(ENDPOINTS.executePay, {
    public_key: PUBLIC_KEY,
    language: params.language ?? "az",
    card_id: params.cardId,
    order_id: params.orderId,
    amount: params.amount,
    currency: params.currency ?? "AZN",
    description: params.description,
  });
}
