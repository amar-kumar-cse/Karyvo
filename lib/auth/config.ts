/**
 * Central auth configuration helpers (safe to import from server, middleware and client code).
 */

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

/**
 * Returns the public Supabase credentials, or null when Supabase is not configured
 * (missing values or the placeholder from .env.example).
 */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || url.includes("your-project") || anonKey === "your-anon-key") {
    return null;
  }
  return { url, anonKey };
}

/**
 * Explicit local-only demo mode. It can NEVER be active in production, and it needs
 * DEMO_MODE=true to be set on purpose. Used only when Supabase is not configured so a
 * developer can still click around the UI locally.
 */
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

export function isDemoMode(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DEMO_MODE === "true" &&
    getSupabaseEnv() === null
  );
}

/** Routes that require a signed-in user (page routes, not /api). */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/resume",
  "/ats",
  "/cover-letter",
  "/interview",
  "/profile",
] as const;

/** Pages that a signed-in user does not need to see (they are sent to the dashboard). */
export const AUTH_PAGES = ["/login", "/signup", "/forgot-password"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Only allow redirects to same-site relative paths. Blocks open redirects such as
 * "//evil.com", "https://evil.com" and "/\\evil.com".
 */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  return next;
}
