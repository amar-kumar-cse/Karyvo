import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/config";

/**
 * Handles the redirect back from Supabase for: email confirmation, password-reset
 * links and OAuth (Google). Exchanges the one-time `code` for a session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, origin));
      }
    }
  }

  const errorDescription = searchParams.get("error_description") || searchParams.get("error");
  const failed = new URL("/login", origin);
  failed.searchParams.set("error", errorDescription || "callback");
  return NextResponse.redirect(failed);
}
