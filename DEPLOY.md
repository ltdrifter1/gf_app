# Deploy YCN (ship today)

YCN (Your Celiac Network) runs on **Next.js 15**. Local uses SQLite; production needs **PostgreSQL**.

## 1. Create a Postgres database

Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or Railway. Copy the connection string.

## 2. Point Prisma at Postgres

In `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"   # was "sqlite"
  url      = env("DATABASE_URL")
}
```

## 3. Deploy to Vercel (recommended)

1. Push this branch / merge to `main`
2. Import the repo in [Vercel](https://vercel.com)
3. Set environment variables:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Postgres URL |
| `AUTH_SECRET` | `openssl rand -base64 48` output (**required**) |

4. Build command: `prisma generate && prisma db push && next build`  
   (or Framework = Next.js; install includes `postinstall` → `prisma generate`)
5. After first deploy, seed once (optional — skip on public launch if you don't want demo users):

```bash
DATABASE_URL="…" AUTH_SECRET="…" npx tsx prisma/seed.ts
```

**Do not seed demo accounts on a public production site** (`maya@ycn.app` / `password123` is for local only).

## 4. Local production-like check

```bash
npm install
cp .env.example .env   # set AUTH_SECRET
npx prisma db push
npx prisma db seed     # local demo only
npm run build && npm start
```

## 5. Go-live checklist

- [ ] `provider = "postgresql"` in schema
- [ ] Strong unique `AUTH_SECRET` (not the example string)
- [ ] No demo credentials on the login page
- [ ] HTTPS via Vercel
- [ ] First admin: register, then set `role = "ADMIN"` in the DB for your user
- [ ] Smoke test: register → post → messenger DM → restaurant map → recipe → health

## Security notes

- Session cookie is httpOnly + Secure in production (`ycn_session`)
- DMs are membership-gated (no auto-join via URL)
- Security headers set in `next.config.mjs`
