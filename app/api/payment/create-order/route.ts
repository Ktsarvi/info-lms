import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/utils/supabase/service";
import { createOrder } from "@/lib/kapital-bank";

const PLANS: Record<string, { months: number; amount: string }> = {
  "1m": { months: 1, amount: "20.00" },
  "6m": { months: 6, amount: "100.00" },
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = body?.plan || "1m";
    const selected = PLANS[plan];
    if (!selected) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { order } = await createOrder({
      amount: selected.amount,
      description: `Info Academy subscription (${plan})`,
    });

    if (!order?.id || !order?.hppUrl || !order?.password) {
      throw new Error("Invalid response from payment gateway");
    }

    const serviceClient = createServiceClient();
    const { error: dbError } = await serviceClient.from("payments").insert({
      kapital_order_id: order.id,
      user_id: user.id,
      amount: selected.amount,
      plan_months: selected.months,
      status: "pending",
    });

    if (dbError) {
      console.error("Database insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to record payment in database" },
        { status: 500 },
      );
    }

    const hppUrl = order.hppUrl.endsWith("/flex")
      ? order.hppUrl
      : `${order.hppUrl}/flex`;

    return NextResponse.json({
      redirectUrl: `${hppUrl}?id=${order.id}&password=${order.password}`,
    });
  } catch (error: unknown) {
    console.error("Create payment order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 },
    );
  }
}
