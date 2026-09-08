// lib/payriff.ts
// Payriff Gateway API client — single env var set, manually toggle base URL for sandbox/prod.

const PAYRIFF_SECRET_KEY = process.env.PAYRIFF_SECRET_KEY!;
const PAYRIFF_MERCHANT_ID = process.env.PAYRIFF_MERCHANT_ID!;

// Toggle this manually between sandbox and production before deploying.
// Based on Payriff docs, the base URL should be https://api.payriff.ae
// Sandbox vs production is controlled by which merchant/secret key you use
// Fallback to .com if .ae times out
const PAYRIFF_BASE_URL = "https://api.payriff.com";

type PayriffResponse<T> = {
  code: string;
  message: string;
  route?: string;
  internalMessage?: string | null;
  responseId?: string;
  payload: T;
};

async function payriffRequest<T>(
  version: "v2" | "v3",
  method: string,
  body: Record<string, unknown>,
  httpMethod: "POST" | "GET" | "DELETE" = "POST",
): Promise<PayriffResponse<T>> {
  const url = `${PAYRIFF_BASE_URL}/api/${version}/${method}`;

  console.log(`Payriff request: ${httpMethod} ${url}`);

  const res = await fetch(url, {
    method: httpMethod,
    headers: {
      Authorization: PAYRIFF_SECRET_KEY, // no "Bearer " prefix
      "Content-Type": "application/json",
    },
    body: httpMethod === "GET" ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });

  const text = await res.text();
  console.log(`Payriff response status: ${res.status}`);

  let data: PayriffResponse<T>;
  try {
    data = JSON.parse(text) as PayriffResponse<T>;
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

  if (data.code !== "00000" && data.code !== "01000") {
    throw new PayriffError(
      data.code,
      data.message,
      data.internalMessage ?? null,
    );
  }

  return data;
}

export class PayriffError extends Error {
  code: string;
  internalMessage: string | null;

  constructor(code: string, message: string, internalMessage: string | null) {
    super(`Payriff error ${code}: ${message}`);
    this.code = code;
    this.internalMessage = internalMessage;
    this.name = "PayriffError";
  }
}

// ---------- Types ----------

export type CreateOrderParams = {
  amount: number;
  description: string;
  callbackUrl: string;
  cardSave?: boolean;
  operation?: "PURCHASE" | "PRE_AUTH";
  language?: "AZ" | "EN" | "RU";
  currency?: "AZN" | "PKR" | "SAR" | "AED";
  approveURL?: string;
  cancelURL?: string;
  declineURL?: string;
  phone?: string;
};

export type CreateOrderPayload = {
  orderId: string;
  sessionId: string;
  paymentUrl: string;
  transactionId: number;
};

export type AutoPayParams = {
  cardUuid: string;
  amount: number;
  description: string;
  callbackUrl: string;
  currency?: "AZN" | "PKR" | "SAR" | "AED";
  orderId?: string;
  sessionId?: string;
};

export type SaveCardParams = {
  customerRef: string;
  callbackUrl: string;
  language?: "AZ" | "EN" | "RU";
  description?: string;
};

export type SaveCardPayload = {
  cardSaveId: string;
  orderId: string;
  sessionId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  status: string;
};

// Loosely typed — Payriff's docs show CANCELED/COMPLETED/etc but the full set isn't
// exhaustively documented for autoPay. Treat unknown values as failures, not successes.
export type AutoPayPayload = {
  orderId: string;
  description: string;
  amount: number;
  auto: boolean;
  operationType: string;
  paymentStatus: string;
  createdDate: string;
  currencyType: string;
  transactions: Array<{
    uuid: string;
    status: string;
    channel: string;
    pan: string;
    cardDetails?: {
      maskedPan: string;
      brand: string;
      uuid: string;
    };
  }>;
  transactionResponseDto?: {
    redirect: boolean;
    redirectUrl?: string;
    transactionResult?: {
      transactionResponse?: {
        status: string;
        responseDescription?: string;
      };
    };
  };
};

export type OrderInfoPayload = {
  orderId: string;
  amount: number;
  currencyType: string;
  paymentStatus: string;
  operationType: string;
  auto: boolean;
  transactions: Array<{
    uuid: string;
    status: string;
    cardDetails?: { maskedPan: string; brand: string; uuid: string };
  }>;
};

// ---------- API methods ----------

/**
 * Creates a new order/payment. Redirect the customer to payload.paymentUrl.
 * Set cardSave: true to store the card as a side effect of this real charge.
 */
export async function createOrder(
  params: CreateOrderParams,
): Promise<CreateOrderPayload> {
  console.log("DEBUG: createOrder called with", params);

  const requestBody: Record<string, unknown> = {
    amount: params.amount,
    language: params.language ?? "AZ",
    currency: params.currency ?? "AZN",
    description: params.description,
    callbackUrl: params.callbackUrl,
    operation: params.operation ?? "PURCHASE",
  };

  // Only include cardSave if it's true (merchant account must have autopay enabled)
  if (params.cardSave === true) {
    requestBody.cardSave = true;
  }

  // Only include phone if provided
  if (params.phone) {
    requestBody.phone = params.phone;
  }
  
  // Only include approveURL, cancelURL, declineURL if they're provided
  if (params.approveURL) requestBody.approveURL = params.approveURL;
  if (params.cancelURL) requestBody.cancelURL = params.cancelURL;
  if (params.declineURL) requestBody.declineURL = params.declineURL;

  const res = await payriffRequest<CreateOrderPayload>(
    "v3",
    "orders",
    requestBody,
  );

  console.log("DEBUG: Payriff response structure:", {
    code: res.code,
    message: res.message,
    hasPayload: !!res.payload,
    payloadKeys: res.payload ? Object.keys(res.payload) : [],
    fullPayload: res.payload,
  });

  if (!res.payload?.orderId || !res.payload?.paymentUrl) {
    console.error("Payriff createOrder missing required fields:", {
      code: res.code,
      message: res.message,
      internalMessage: res.internalMessage,
      payload: res.payload,
    });
    throw new PayriffError(
      res.code,
      "Payriff createOrder returned no orderId/paymentUrl",
      res.internalMessage ?? null,
    );
  }
  return res.payload;
}

/**
 * Charges a previously saved card (cardUuid) without redirecting the user.
 * Used for auto-renewal.
 *
 * IMPORTANT: a successful HTTP/code response here does NOT mean the payment
 * succeeded — always check payload.paymentStatus (e.g. "COMPLETED") before
 * treating the renewal as paid. See isAutoPaySuccessful() below.
 */
export async function autoPay(params: AutoPayParams): Promise<AutoPayPayload> {
  const res = await payriffRequest<AutoPayPayload>("v3", "autoPay", {
    cardUuid: params.cardUuid,
    amount: params.amount,
    currency: params.currency ?? "AZN",
    description: params.description,
    callbackUrl: params.callbackUrl,
    operation: "PURCHASE",
    ...(params.orderId ? { orderId: params.orderId } : {}),
    ...(params.sessionId ? { sessionId: params.sessionId } : {}),
  });
  return res.payload;
}

/** Fetches order/payment status and details by orderId. */
export async function getOrderInfo(orderId: string): Promise<OrderInfoPayload> {
  const url = `${PAYRIFF_BASE_URL}/api/v3/orders/${encodeURIComponent(orderId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: PAYRIFF_SECRET_KEY },
  });
  const data = (await res.json()) as PayriffResponse<OrderInfoPayload>;

  if (data.code !== "00000" && data.code !== "01000") {
    throw new PayriffError(
      data.code,
      data.message,
      data.internalMessage ?? null,
    );
  }

  return data.payload;
}

/**
 * Deletes a saved card. Irreversible — the card can no longer be used for autoPay.
 */
export async function deleteSavedCard(cardUuid: string): Promise<void> {
  const url = `${PAYRIFF_BASE_URL}/api/v3/cards/${cardUuid}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: PAYRIFF_SECRET_KEY },
  });
  const data = (await res.json()) as PayriffResponse<null>;

  if (data.code !== "00000" && data.code !== "01000") {
    throw new PayriffError(
      data.code,
      data.message,
      data.internalMessage ?? null,
    );
  }
}

/**
 * Initiates card save process for 1Click checkout.
 * Customer is redirected to paymentUrl to enter card details (0.01 AZN verification).
 */
export async function saveCard(
  params: SaveCardParams
): Promise<SaveCardPayload> {
  const res = await payriffRequest<SaveCardPayload>("v3", "cards/save", {
    customerRef: params.customerRef,
    callbackUrl: params.callbackUrl,
    language: params.language ?? "AZ",
    description: params.description ?? "Card save for 1Click checkout",
  });
  return res.payload;
}

// ---------- Invoices API ----------

export type CreateInvoiceParams = {
  amount: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  description: string;
  currencyType?: "AZN" | "USD" | "EUR";
  languageType?: "AZ" | "EN" | "RU";
  expireDate: string;
  approveURL?: string;
  cancelURL?: string;
  declineURL?: string;
  sendSms?: boolean;
  sendEmail?: boolean;
  sendWhatsapp?: boolean;
  directPay?: boolean;
  customMessage?: string;
};

export type CreateInvoicePayload = {
  id: number;
  paymentUrl: string;
  invoiceUuid: string;
  invoiceCode: number;
  invoiceStatus: string;
};

/**
 * Creates an invoice and automatically sends payment link via SMS/Email.
 * Used for subscription renewal notifications.
 */
export async function createInvoice(
  merchantId: string,
  params: CreateInvoiceParams
): Promise<CreateInvoicePayload> {
  const res = await payriffRequest<CreateInvoicePayload>("v2", "invoices", {
    merchant: merchantId,
    body: params,
  });
  return res.payload;
}

/**
 * Central place to interpret an AutoPay/Order payload's actual payment outcome.
 * Per Payriff docs: the top-level `code`/`message` only confirm the API call was
 * processed — NOT that the payment succeeded. Always gate renewal logic on this.
 */
export function isPaymentSuccessful(paymentStatus: string): boolean {
  return (
    paymentStatus === "APPROVED" ||
    paymentStatus === "ACCEPTED" ||
    paymentStatus === "PAID" ||
    paymentStatus === "COMPLETED"
  );
}

/**
 * Returns true if the payment status is a terminal failure (will not change).
 * Used to distinguish between terminal failures (should mark payment as failed)
 * and intermediate/pending states (should leave payment pending for retry).
 */
export function isPaymentTerminalFailure(paymentStatus: string): boolean {
  return (
    paymentStatus === "FAILED" ||
    paymentStatus === "DECLINED" ||
    paymentStatus === "CANCELED" ||
    paymentStatus === "REJECTED"
  );
}
