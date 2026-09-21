import { NextRequest } from "next/server";

export interface AuthUser {
  userId: string;
}

/**
 * Lightweight auth helper.
 * - In dev (no Supabase): returns a default user with a console warning.
 * - In production: validates the Authorization header.
 *
 * When you add Supabase Auth, replace the production branch with:
 *   import { createClient } from "@supabase/supabase-js";
 *   const { data: { user }, error } = await supabase.auth.getUser(token);
 */
export async function getUser(req: NextRequest | Request): Promise<AuthUser> {
  const authHeader = (req.headers as Headers).get("authorization");

  // If a Bearer token is provided, extract userId from it
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (!token) throw new AuthError("Missing auth token");

    // TODO: When Supabase Auth is configured, validate the JWT here:
    // const { data, error } = await supabase.auth.getUser(token);
    // if (error || !data.user) throw new AuthError("Invalid token");
    // return { userId: data.user.id };

    // For now, treat the token as a user ID (dev convenience)
    return { userId: token };
  }

  // No auth header — in development, allow a default user
  if (process.env.NODE_ENV !== "production") {
    return { userId: "user-default" };
  }

  throw new AuthError("Authentication required");
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
