# Lumen

**Your gluten-free companion. Find your people — and a little more light.**

Lumen is a **gluten-free social network** with an MSN Messenger–style chat lounge.
Full-stack **Next.js 15** + **TypeScript** + **Tailwind** + **Prisma** + **PostgreSQL**.

Design: glassmorphism with MSN gloss. Brand gradient: `bg-lumen-gradient`.
Product name lives in `src/lib/brand.ts` (`BRAND`).
Current production domain: `safelyceliac.com` (host is unchanged in this pass).

## Surface

| Feature | Route |
|---------|-------|
| Landing | `/` |
| Auth | `/login`, `/register` |
| Community feed | `/app` (`?scope=following`) |
| Public profiles | `/app/u/[username]` |
| Messenger | `/app/chat`, `/app/chat/[slug]` |
| Journal / Track | `/app/journal`, `/app/journal?tab=track` |
| Restaurants | `/app/restaurants` |
| Recipes | `/app/recipes` (`?category=Kids`) |
| Health | `/app/health` (`?tab=mental` \| `physical` \| `care`) |
| Label / menu scan | `/app/scan` |
| GF cost tracker | `/app/costs` |
| Forgot / reset password | `/forgot`, `/reset` |
| Saved / Search / Profile | `/app/saved`, `/app/search`, `/app/profile` |
| Admin | `/app/admin` |

## Companion upgrades

- **Buddy match** — Messenger “Find me a buddy” (also Health + onboarding). Soft match on `journeyStage` + city. DM + icebreaker + companion notifications. Rate-limited.
- **I got gluten** — Recovery card on Health (`#recovery`) and Messenger me-strip. Optional private `HealthLog` + buddy check-in (`::checkin::`) with no details.
- **MSN statuses** — `need-check-in`, `dining-out`, `quiet-today`, `helping-new` plus classic online/away/offline. Buddy list sorts need-check-in first.
- **Label scan** — Photo (Tesseract on-device), barcode (Open Food Facts), or paste → Safe / Caution / Unsafe / Unknown. Not lab-grade.
- **Canadian GF costs** — Receipts + monthly list + CRA-style CSV. Not tax advice.
- **Dining tonight** — Auto city rooms `city-{city}-tonight` in Messenger; archived after ~10:00 UTC.
- **Dining trust** — New spots are **pending** until an admin publishes. Claims cap at 50%. Cross-contact incidents demote to **disputed** and ping nearby diners. Admin can hide / unpublish / resolve flags.
- **Safety** — Block/mute, DM message requests (auto-accept for follows/buddies), working flag queue.
- **Account** — Forgot password (Resend or local dev link), ZIP export, delete account, notification prefs + quiet hours.
- **Uploads / scan** — Photos via Vercel Blob or `public/uploads`. OCR text shown. Miss reports. 90-day scan retention unless kept.
- **PWA** — `manifest` + `public/sw.js`. In-tab Notification API; Web Push when VAPID is set.
- **Private insights** — Opt-in on Profile / Health / Journal from Mood + HealthLog + Journal.
- **Caregiver pack** — `/app/health?tab=care` letters, 30-second scripts, Kids recipes.
- **Infra** — Redis rate limits when Upstash is set (memory fallback). Search uses ILIKE. Dining `?lat&lng` distance sort. CSP. Vitest + GitHub Actions CI. ESLint runs during builds.

## Cursor Cloud notes

- Dev: Postgres required — see `.env.example`, then `npm run dev` → http://localhost:3000
- Reset: `npx prisma db push --force-reset && npx prisma db seed`
- Demo (local only): `maya@lumen.app` / `password123`
- Prod catalog (no demos): `npm run db:seed:prod` — also auto-runs via `ensureLaunchCatalog`
- Production domain: `https://safelyceliac.com` (see `DEPLOY.md` for Namecheap → Vercel DNS)
- `AUTH_SECRET` is required in production (fails closed)
- Vercel build: `ship:build` (see `vercel.json`)
- DMs are membership-gated; community rooms auto-join
- Chat/presence: SSE live stream (+ short poll fallback); live statuses = lastSeen < 60s
- Auth cookie: `lumen_session` (readers still accept legacy `safely_session`; login writes the new name and drops the old one)
- Rate limits on register / login / chat send / buddy match / scans / password reset
- Optional Web Push: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (in-tab alerts still work without them)
- Optional Redis: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (in-memory fallback)
- Optional email: `RESEND_API_KEY` + `EMAIL_FROM` (password reset shows a local link in development)
- Optional uploads: `BLOB_READ_WRITE_TOKEN` (otherwise `public/uploads`)
