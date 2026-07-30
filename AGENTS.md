# YCN — Your Celiac Network

**Connect. Share. Belong.**

YCN is a **gluten-free social network** with an MSN Messenger–style chat lounge.
Full-stack **Next.js 15** + **TypeScript** + **Tailwind** + **Prisma** + **PostgreSQL**.

Design: glassmorphism with MSN gloss. Brand gradient: `bg-ycn-gradient`.

## Surface

| Feature | Route |
|---------|-------|
| Landing | `/` |
| Auth | `/login`, `/register` |
| Community feed | `/app` (`?scope=following`) |
| Public profiles | `/app/u/[username]` |
| Messenger | `/app/chat`, `/app/chat/[slug]` |
| Restaurants | `/app/restaurants` |
| Recipes | `/app/recipes` |
| Health | `/app/health` |
| Saved / Search / Profile | `/app/saved`, `/app/search`, `/app/profile` |
| Admin | `/app/admin` |

## Cursor Cloud notes

- Dev: Postgres required — see `.env.example`, then `npm run dev` → http://localhost:3000
- Reset: `npx prisma db push --force-reset && npx prisma db seed`
- Demo (local only): `maya@ycn.app` / `password123`
- Prod catalog (no demos): `npm run db:seed:prod` — also auto-runs via `ensureLaunchCatalog`
- `AUTH_SECRET` is required in production (fails closed)
- Vercel build: `ship:build` (see `vercel.json`)
- DMs are membership-gated; community rooms auto-join
- Chat/presence: HTTP polling (~2.5s); online = lastSeen < 60s
- Auth cookie: `ycn_session`
- Rate limits on register / login / chat send
