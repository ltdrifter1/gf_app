# Deploy Safely to safelyceliac.com

Safely runs on **Next.js 15** + **PostgreSQL**, hosted on **Vercel**, with DNS at **Namecheap**.

## 1. Create a Postgres database

Use [Neon](https://neon.tech) (recommended), Supabase, Railway, or Vercel Postgres.

1. Create a project / database
2. Copy the connection string (include `?sslmode=require`)

## 2. Deploy the GitHub repo to Vercel

1. Open [vercel.com/new](https://vercel.com/new) and import `ltdrifter1/gf_app`
2. Framework: Next.js (auto). Build command is set in `vercel.json` → `npm run ship:build`
3. Add environment variables (Production + Preview):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Postgres URL (`?sslmode=require`) |
| `AUTH_SECRET` | Strong secret — `openssl rand -base64 48` |
| `NEXT_PUBLIC_APP_URL` | `https://safelyceliac.com` |

4. Deploy. Confirm the `*.vercel.app` URL loads.

### Build failed: `Environment variable not found: DATABASE_URL` (P1012)

Vercel ran `prisma db push` without `DATABASE_URL`. Fix:

1. **Settings → Environment Variables**
2. Add `DATABASE_URL` = Neon URL (`?sslmode=require`) for **Production** and **Preview**
3. Add `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL=https://safelyceliac.com`
4. **Deployments → … → Redeploy** (env vars are not applied to an already-failed build until redeploy)

5. Optional catalog bootstrap (also auto-runs on first request):

```bash
DATABASE_URL="…" npx tsx prisma/seed-prod.ts
```

**Do not run `prisma/seed.ts` in production** — that creates demo logins.

## 3. Attach safelyceliac.com in Vercel

1. Vercel project → **Settings → Domains**
2. Add `safelyceliac.com` and `www.safelyceliac.com`
3. Prefer redirect: `www` → apex (or the reverse — pick one canonical)

Vercel will show the exact DNS targets. Typical Namecheap records:

| Type | Host | Value | TTL |
|------|------|--------|-----|
| **A** | `@` | `76.76.21.21` | Automatic |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Automatic |

## 4. Namecheap DNS

1. Namecheap → **Domain List** → `safelyceliac.com` → **Manage**
2. **Advanced DNS**
3. Remove the Namecheap **Parking Page** / URL Redirect records (the ones pointing at `parkingpage.namecheap.com` / `192.64.119.254`)
4. Add the A + CNAME rows from the table above (or whatever Vercel shows)
5. Save. Propagation is often minutes; can take up to ~30–60 minutes

Leave **Nameservers** on Namecheap BasicDNS (`dns1/dns2.registrar-servers.com`) unless you intentionally switch to Vercel nameservers.

## 5. Go-live checklist

- [ ] `DATABASE_URL` points at hosted Postgres
- [ ] Strong unique `AUTH_SECRET` (not the example string)
- [ ] `NEXT_PUBLIC_APP_URL=https://safelyceliac.com`
- [ ] Vercel build uses `ship:build`
- [ ] Catalog present (`ensureLaunchCatalog` or `db:seed:prod`)
- [ ] No demo credentials on the login page
- [ ] HTTPS works on https://safelyceliac.com
- [ ] First admin: register, then set `role = "ADMIN"` in the DB
- [ ] Smoke test: register → Messenger → post → restaurants → recipes → health

## Local development

```bash
cp .env.example .env
# DATABASE_URL=postgresql://safely:safely@localhost:5432/safely
npx prisma db push
npx prisma db seed          # local demo users only
npm run dev
```

## Security notes

- Session cookie is httpOnly + Secure in production (`safely_session`)
- DMs are membership-gated (no auto-join via URL)
- Security headers set in `next.config.mjs`
- Rate limits: register 5/hr/IP, login 10/15min/IP, chat send 30/min/user
