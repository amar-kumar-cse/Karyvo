"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Sparkles, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { GlassCard, GlassButton, GlassInput } from "@/components/ui/glass";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/auth/config";

export type AuthMode = "login" | "signup" | "forgot" | "reset";

const COPY: Record<AuthMode, { title: string; subtitle: string; cta: string }> = {
  login: { title: "Welcome back", subtitle: "Log in to continue building your career profile.", cta: "Log in" },
  signup: { title: "Create your account", subtitle: "Save your resumes, scans and interview practice securely.", cta: "Create account" },
  forgot: { title: "Reset your password", subtitle: "Enter your email and we will send you a reset link.", cta: "Send reset link" },
  reset: { title: "Choose a new password", subtitle: "Pick a strong password you have not used before.", cta: "Update password" },
};

const MIN_PASSWORD = 8;

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please verify your email first. Check your inbox for the confirmation link.";
  if (m.includes("already registered") || m.includes("already been registered")) return "An account with this email already exists. Try logging in.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("password should be")) return `Password must be at least ${MIN_PASSWORD} characters.`;
  if (m.includes("unsupported provider") || m.includes("provider is not enabled")) {
    return "Google Sign-In is not enabled in your Supabase project yet. Please enable Google in Supabase Dashboard > Authentication > Providers, or sign in below with email and password.";
  }
  return message || "Something went wrong. Please try again.";
}

export function AuthForm({
  mode,
  next: nextProp,
  callbackError,
}: {
  mode: AuthMode;
  next?: string;
  callbackError?: string | boolean;
}) {
  const router = useRouter();
  const next = safeNextPath(nextProp);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    typeof callbackError === "string"
      ? (callbackError === "callback" ? "Sign-in link is invalid or has expired. Please try again." : friendlyError(callbackError))
      : callbackError
      ? "Sign-in link is invalid or has expired. Please try again."
      : null
  );
  const [info, setInfo] = useState<string | null>(null);

  const copy = COPY[mode];
  const showEmail = mode !== "reset";
  const showPassword = mode !== "forgot";
  const showConfirm = mode === "signup" || mode === "reset";

  const callbackUrl = (target: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Authentication is not configured yet. Add your Supabase keys to .env.local.");
      return;
    }

    if (showEmail && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (showPassword && mode !== "login" && password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (showConfirm && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
        router.replace(next);
        router.refresh();
      } else if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: callbackUrl(next) },
        });
        if (err) throw err;
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else {
          setInfo("Almost done! We sent a confirmation link to your email. Click it to activate your account.");
        }
      } else if (mode === "forgot") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: callbackUrl("/reset-password"),
        });
        if (err) throw err;
        // Same message whether or not the account exists (prevents account enumeration).
        setInfo("If an account exists for that email, a password reset link is on its way.");
      } else if (mode === "reset") {
        const { error: err } = await supabase.auth.updateUser({ password });
        if (err) throw err;
        setInfo("Password updated. Redirecting...");
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Authentication is not configured yet. Add your Supabase keys to .env.local.");
      return;
    }
    setGoogleLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl(next),
          skipBrowserRedirect: true,
        },
      });

      if (err) {
        setError(friendlyError(err.message));
        setGoogleLoading(false);
        return;
      }

      if (data?.url) {
        // Pre-check if Google OAuth provider is active on Supabase without navigating away
        const res = await fetch(data.url, { method: "GET" }).catch(() => null);
        if (res && !res.ok) {
          const body = await res.json().catch(() => null);
          const rawMsg =
            body?.msg ||
            body?.error_description ||
            body?.message ||
            "Unsupported provider: provider is not enabled";
          setError(friendlyError(rawMsg));
          setGoogleLoading(false);
          return;
        }
        // If provider is active, navigate to Google login
        window.location.href = data.url;
      } else {
        setError("Could not generate Google authorization link.");
        setGoogleLoading(false);
      }
    } catch (e: any) {
      setError(friendlyError(e?.message || "Could not connect to Google sign-in."));
      setGoogleLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
      <GlassCard className="w-full space-y-6 p-7 sm:p-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900">{copy.title}</h1>
          <p className="text-sm text-slate-600">{copy.subtitle}</p>
        </div>

        {(mode === "login" || mode === "signup") && (
          <>
            <GlassButton type="button" variant="outline" size="md" className="w-full" onClick={onGoogle} loading={googleLoading}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
                <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
                <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.8V6.5H1.4a12 12 0 0 0 0 11l4-3.1z" />
                <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
              </svg>
              Continue with Google
            </GlassButton>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or with email</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          </>
        )}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {showEmail && (
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <GlassInput id="email" type="email" autoComplete="email" required placeholder="you@example.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          )}

          {showPassword && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  {mode === "reset" ? "New password" : "Password"}
                </label>
                {mode === "login" && (
                  <Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Forgot password?</Link>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <GlassInput id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "login" ? undefined : MIN_PASSWORD} placeholder={mode === "login" ? "Your password" : `At least ${MIN_PASSWORD} characters`} className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
          )}

          {showConfirm && (
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-xs font-semibold text-slate-700">Confirm password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <GlassInput id="confirm" type="password" autoComplete="new-password" required placeholder="Repeat password" className="pl-9" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            </div>
          )}

          <div aria-live="polite" className="space-y-2">
            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}
            {info && (
              <p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{info}</span>
              </p>
            )}
          </div>

          <GlassButton type="submit" size="lg" className="w-full" loading={loading}>
            {copy.cta}
          </GlassButton>
        </form>

        <p className="text-center text-xs text-slate-600">
          {mode === "login" && (
            <>New to Karyvo? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-indigo-600 hover:text-indigo-700">Create an account</Link></>
          )}
          {mode === "signup" && (
            <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-indigo-600 hover:text-indigo-700">Log in</Link></>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Back to log in</Link>
          )}
        </p>
      </GlassCard>
    </div>
  );
}
