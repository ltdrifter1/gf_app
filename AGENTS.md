# Safely

**Your gluten-free companion. Find your people.**

Safely is a **gluten-free social network** with an MSN Messenger–style chat lounge.
Full-stack **Next.js 15** + **TypeScript** + **Tailwind** + **Prisma** + **PostgreSQL**.

Design: glassmorphism with MSN gloss. Brand gradient: `bg-safely-gradient`.

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
| Recipes | `/app/recipes` |
| Health | `/app/health` (`?tab=mental` \| `physical`) |
| Saved / Search / Profile | `/app/saved`, `/app/search`, `/app/profile` |
| Admin | `/app/admin` |

## Cursor Cloud notes

- Dev: Postgres required — see `.env.example`, then `npm run dev` → http://localhost:3000
- Reset: `npx prisma db push --force-reset && npx prisma db seed`
- Demo (local only): `maya@safely.app` / `password123`
- Prod catalog (no demos): `npm run db:seed:prod` — also auto-runs via `ensureLaunchCatalog`
- Production domain: `https://safelyceliac.com` (see `DEPLOY.md` for Namecheap → Vercel DNS)
- `AUTH_SECRET` is required in production (fails closed)
- Vercel build: `ship:build` (see `vercel.json`)
- DMs are membership-gated; community rooms auto-join
- Chat/presence: SSE live stream (+ short poll fallback); online = lastSeen < 60s
- Auth cookie: `safely_session`
- Rate limits on register / login / chat send
