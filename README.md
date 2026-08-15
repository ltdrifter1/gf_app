# Safely

**Your gluten-free companion. Find your people.**

A gluten-free social network with an MSN Messenger–style lounge — community,
safe dining, recipes, and health support.

Built with Next.js 15, React, TypeScript, Tailwind CSS, and Prisma.

## Quick start (local)

```bash
npm install
cp .env.example .env   # set DATABASE_URL to Postgres + AUTH_SECRET
npx prisma db push
npx prisma db seed     # local demo users only
npm run dev            # http://localhost:3000
```

Local demo login (dev only): `maya@safely.app` / `password123`

## Ship to production

See **[DEPLOY.md](./DEPLOY.md)** — Postgres + Vercel + Namecheap DNS for **https://safelyceliac.com**.  
Catalog boots safely without demo accounts (`npm run db:seed:prod` or auto on first request).

## Features

- **Community feed** — All / Following, topics, posts, comments, likes
- **Messenger** — online buddy list, DMs, community rooms, presence
- **Restaurants** — city filters, list/map tabs, safety scores
- **Recipes** — search, sort, ratings, author profiles
- **Health** — mental check-ins + physical tips
- **Profiles** — public pages, follow, edit
