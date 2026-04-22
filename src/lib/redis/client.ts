import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { type CartItem } from "@/server/db/schema";

export const redis = Redis.fromEnv();

// ─── Cart Utilities ───────────────────────────────────────────────────────────

export async function getCart(sessionId: string): Promise<CartItem[] | null> {
  return redis.get<CartItem[]>(`cart:${sessionId}`);
}

export async function setCart(
  sessionId: string,
  items: CartItem[]
): Promise<void> {
  await redis.setex(`cart:${sessionId}`, 60 * 60 * 24 * 7, items);
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

/** 10 messages per minute per session for AI chat */
export const chatRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "ratelimit:chat",
});

// ─── Generic Cache Helper ─────────────────────────────────────────────────────

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;
  const result = await fn();
  await redis.setex(key, ttl, result as Parameters<typeof redis.setex>[2]);
  return result;
}
