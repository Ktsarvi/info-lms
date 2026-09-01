import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    payriffSecretKey: process.env.PAYRIFF_SECRET_KEY ? "SET" : "NOT_SET",
    payriffMerchantId: process.env.PAYRIFF_MERCHANT_ID ? "SET" : "NOT_SET",
    payriffCallbackUrl: process.env.PAYRIFF_CALLBACK_URL || "NOT_SET",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT_SET",
  });
}