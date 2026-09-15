import "server-only";

import { headers } from "next/headers";
import { redisCommand, redisConfigured } from "@/lib/redis";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (entry.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  entry.count += 1;
  return { ok: true };
}

/** Redis when configured (Vercel multi-instance); in-memory otherwise. */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  if (redisConfigured()) {
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
    const n = await redisCommand<number>("INCR", `rl:${key}`);
    if (typeof n === "number") {
      if (n === 1) await redisCommand("EXPIRE", `rl:${key}`, windowSec);
      if (n > limit) {
        const ttl = Number(await redisCommand<number>("TTL", `rl:${key}`)) || windowSec;
        return { ok: false, retryAfterSec: Math.max(1, ttl) };
      }
      return { ok: true };
    }
  }
  return memoryLimit(key, limit, windowMs);
}

export async function clientIpKey(prefix: string) {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || h.get("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) {
      if (now >= v.resetAt) buckets.delete(k);
    }
  }, 60_000).unref?.();
}
