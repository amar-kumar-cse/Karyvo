"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/auth/config";

/**
 * Browser Supabase client (anon key + the user's own session). Returns null when
 * Supabase is not configured so UI can show a helpful message instead of crashing.
 */
export function createSupabaseBrowserClient() {
  const env = getSupabaseEnv();
  if (!env) return null;
  return createBrowserClient(env.url, env.anonKey);
}
