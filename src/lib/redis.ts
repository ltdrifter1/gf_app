import "server-only";

/**
 * Optional Upstash Redis REST. Without env vars, callers fall back to memory.
 * Serverless-safe: no persistent sockets.
 */

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function redisConfigured() {
  return Boolean(redisConfig());
}

export async function redisCommand<T = unknown>(...args: (string | number)[]): Promise<T | null> {
  const cfg = redisConfig();
  if (!cfg) return null;
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args.map(String)),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { result?: T };
  return json.result ?? null;
}
