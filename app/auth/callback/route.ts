import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { translateSupabaseError } from "@/utils/supabase/error-translations";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", requestUrl.origin),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    const errorMessage = error?.message ?? "auth_failed";
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(errorMessage)}`,
        requestUrl.origin,
      ),
    );
  } 

  // Check subscription status to decide where to send them
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_subscribed, subscription_expires_at")
    .eq("id", data.user.id)
    .single();

  const isActive =
    profile?.is_subscribed &&
    (!profile.subscription_expires_at ||
      new Date(profile.subscription_expires_at) > new Date());

  return NextResponse.redirect(
    new URL(isActive ? "/courses" : "/pricing", requestUrl.origin),
  );
}
