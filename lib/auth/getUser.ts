import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export interface AuthUser {
  userId: string;
  email?: string;
}

export class AuthError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthError";
  }
}

// Lazy-initialized Supabase client for auth verification
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project")) {
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * C1/C2: Authenticate and retrieve user identity.
 * 1. Checks Authorization: Bearer <token>
 * 2. Checks Supabase session cookies
 * 3. Validates via Supabase Auth if credentials are configured
 * 4. Falls back safely to dev user only in non-production environments
 */
export async function getUser(req: NextRequest | Request): Promise<AuthUser> {
  const headers = req.headers as Headers;
  const authHeader = headers.get("authorization");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  // If no bearer token, attempt to extract access token from cookies
  if (!token) {
    try {
      const cookieStore = await cookies();
      const sbTokenCookie =
        cookieStore.get("sb-access-token")?.value ||
        cookieStore.get("supabase-auth-token")?.value ||
        cookieStore.get("sb:token")?.value;
      if (sbTokenCookie) {
        token = sbTokenCookie;
      }
    } catch {
      // Cookie store may not be available in all execution contexts
    }
  }

  // Also support custom developer / test user header in non-production
  const devUserIdHeader = headers.get("x-user-id");
  if (process.env.NODE_ENV !== "production" && devUserIdHeader) {
    return { userId: devUserIdHeader.trim() };
  }

  const supabase = getSupabaseClient();

  if (token) {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
          throw new AuthError("Invalid or expired session token");
        }
        return {
          userId: data.user.id,
          email: data.user.email,
        };
      } catch (err) {
        if (err instanceof AuthError) throw err;
        console.error("Supabase auth verification failed:", err);
        throw new AuthError("Authentication verification failed");
      }
    }

    // In dev mode when Supabase is not connected, use the token as the user ID
    if (process.env.NODE_ENV !== "production") {
      return { userId: token };
    }
  }

  // If in non-production without token, allow default development user
  if (process.env.NODE_ENV !== "production") {
    return { userId: "user-default" };
  }

  throw new AuthError("Authentication required. Please log in.");
}
