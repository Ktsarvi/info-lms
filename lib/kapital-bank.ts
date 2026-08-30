const BASE_URL = process.env.KAPITAL_BASE_URL!;
const AUTH_HEADER =
  "Basic " +
  Buffer.from(
    `${process.env.KAPITAL_USERNAME}:${process.env.KAPITAL_PASSWORD}`,
  ).toString("base64");

async function kapitalFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH_HEADER,
      ...(init?.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok || data.errorCode) {
    throw new Error(
      data.errorDescription || `Kapital Bank request failed: ${res.status}`,
    );
  }
  return data;
}

export async function createOrder(params: {
  amount: string;
  currency?: string;
  title?: string;
  description: string;
}) {
  return kapitalFetch("/order", {
    method: "POST",
    body: JSON.stringify({
      order: {
        typeRid: "Order_SMS",
        amount: params.amount,
        currency: params.currency ?? "AZN",
        language: "az",
        title: params.title ?? "Info Academy",
        description: params.description,
        hppRedirectUrl: process.env.KAPITAL_REDIRECT_URL,
      },
    }),
  });
}

export async function getOrderDetails(orderId: number) {
  return kapitalFetch(`/order/${orderId}?tranDetailLevel=2`, { method: "GET" });
}
