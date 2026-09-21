/**
 * Simple in-memory sliding window rate limiter.
 * No npm package needed — just a Map + timestamps.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

/**
 * Check if a request should be rate limited.
 *
 * @param key - Unique identifier (e.g., userId or IP + route)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60s)
 * @returns { limited: boolean; remaining: number; retryAfterMs?: number }
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 60_000
): { limited: boolean; remaining: number; retryAfterMs?: number } {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return {
      limited: true,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  entry.timestamps.push(now);
  return {
    limited: false,
    remaining: maxRequests - entry.timestamps.length,
  };
}

/** Pre-configured limiters for different route categories */
export const RATE_LIMITS = {
  /** AI-heavy routes: 10 requests per minute */
  ai: { maxRequests: 10, windowMs: 60_000 },
  /** Standard CRUD routes: 30 requests per minute */
  standard: { maxRequests: 30, windowMs: 60_000 },
  /** Payment routes: 5 requests per minute */
  payment: { maxRequests: 5, windowMs: 60_000 },
} as const;
