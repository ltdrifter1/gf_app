# Deploy YCN (ship today)

YCN (Your Celiac Network) runs on **Next.js 15** + **PostgreSQL**.

## 1. Create a Postgres database

Use [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app), or Vercel Postgres. Copy the connection string.

## 2. Deploy to Vercel

1. Push / merge to `main`
2. Import the repo in [Vercel](https://vercel.com)
3. Set environment variables:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Postgres URL (`?sslmode=require` for hosted) |
| `AUTH_SECRET` | `openssl rand -base64 48` output (**required**) |

4. Build is locked via `vercel.json` → `npm run ship:build`  
   (`prisma generate && prisma db push && next build`)

5. Optional one-shot catalog bootstrap (also runs automatically on first page load / signup):

```bash
DATABASE_URL="…" npx tsx prisma/seed-prod.ts
```

**Do not run `prisma/seed.ts` on a public production site** — that creates demo logins (`maya@ycn.app` / `password123`). Use `seed-prod.ts` only.

## 3. Local development

Postgres is required locally too:

```bash
# example after creating role/db `ycn`
cp .env.example .env
# DATABASE_URL=postgresql://ycn:ycn@localhost:5432/ycn
npx prisma db push
npx prisma db seed          # local demo users only
npm run dev
```

## 4. Go-live checklist

- [ ] `DATABASE_URL` points at Postgres
- [ ] Strong unique `AUTH_SECRET` (not the example string)
- [ ] Vercel build uses `ship:build` (default via `vercel.json`)
- [ ] Catalog present (auto via `ensureLaunchCatalog`, or `npm run db:seed:prod`)
- [ ] No demo credentials on the login page
- [ ] HTTPS via Vercel
- [ ] First admin: register, then set `role = "ADMIN"` in the DB for your user
- [ ] Smoke test: register → Messenger room → post → restaurant map → recipe → health

## Security notes

- Session cookie is httpOnly + Secure in production (`ycn_session`)
- DMs are membership-gated (no auto-join via URL)
- Security headers set in `next.config.mjs`
- Rate limits: register 5/hr/IP, login 10/15min/IP, chat send 30/min/user
