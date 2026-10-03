import { repository } from "@/lib/db/repository";

export interface ProStatus {
  isPro: boolean;
  plan: "pro" | "free";
  status: string;
  currentPeriodEnd?: string | null;
}

/**
 * Server-side subscription and Pro entitlement verification.
 * Validates plan === "pro", status === "active", and ensures currentPeriodEnd has not elapsed.
 */
export async function checkProStatus(userId: string): Promise<ProStatus> {
  const sub = await repository.getSubscription(userId);
  if (!sub || sub.plan !== "pro" || sub.status !== "active") {
    return {
      isPro: false,
      plan: "free",
      status: sub?.status || "inactive",
      currentPeriodEnd: sub?.currentPeriodEnd,
    };
  }

  // Check expiration if currentPeriodEnd is recorded
  if (sub.currentPeriodEnd) {
    const expiresAt = new Date(sub.currentPeriodEnd).getTime();
    if (expiresAt < Date.now()) {
      return {
        isPro: false,
        plan: "free",
        status: "expired",
        currentPeriodEnd: sub.currentPeriodEnd,
      };
    }
  }

  return {
    isPro: true,
    plan: "pro",
    status: "active",
    currentPeriodEnd: sub.currentPeriodEnd,
  };
}

/**
 * Gatekeeper helper for protected/pro-only API routes and server actions.
 * Throws a 403 Forbidden error if user does not possess an active Pro plan.
 */
export async function requirePro(userId: string): Promise<ProStatus> {
  const status = await checkProStatus(userId);
  if (!status.isPro) {
    const error = new Error("This feature requires an active Karyvo Pro subscription.");
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
  return status;
}
