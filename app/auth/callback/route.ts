import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

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

  // Email is now confirmed. Clear only this callback session so they land
  // on /login (middleware would otherwise bounce an authenticated user).
  const { error: signOutError } = await supabase.auth.signOut({
    scope: "local",
  });

  if (signOutError) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(signOutError.message)}`,
        requestUrl.origin,
      ),
    );
  }

  return NextResponse.redirect(
    new URL("/login?confirmed=1", requestUrl.origin),
  );
}
