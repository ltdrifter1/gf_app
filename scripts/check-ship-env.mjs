#!/usr/bin/env node
/**
 * Fail fast with a clear message when Vercel/local ship builds
 * are missing required env (Prisma P1012 is otherwise cryptic).
 */
const required = ["DATABASE_URL"];
const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length) {
  console.error(`
┌──────────────────────────────────────────────────────────────┐
│  ship:build missing env: ${missing.join(", ").padEnd(34)}│
├──────────────────────────────────────────────────────────────┤
│  On Vercel: Project → Settings → Environment Variables      │
│  Add DATABASE_URL (Neon URL, ?sslmode=require) for          │
│  Production + Preview, then Redeploy.                       │
│  Also set AUTH_SECRET and NEXT_PUBLIC_APP_URL.              │
│  See DEPLOY.md                                              │
└──────────────────────────────────────────────────────────────┘
`);
  process.exit(1);
}

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.AUTH_SECRET ||
    process.env.AUTH_SECRET.includes("dev-secret-change-me"))
) {
  console.warn(
    "⚠ AUTH_SECRET is missing or still the example value — set a strong secret before going live."
  );
}
