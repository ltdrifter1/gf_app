# Circle

**Find your Circle.** A polished gluten-free social network with an MSN
Messenger–style lounge — community, safe dining, recipes, and health support.

Built with Next.js 15, React, TypeScript, Tailwind CSS, and Prisma.

## Quick start

```bash
npm install
cp .env.example .env
npx prisma db push
npx prisma db seed
npm run dev            # http://localhost:3000
```

Demo login: `maya@circle.app` / `password123` (admin: `admin@circle.app`).

## Features

- **Community feed** — posts, comments, likes, saves
- **Messenger** — buddy-list rooms, presence, typing
- **Restaurants** — community-scored safe dining + map
- **Recipes** — GF recipe database with ratings
- **Health** — mental check-ins + physical healing tips
- **Premium** — optional supporter badge (Stripe-ready or simulated)
