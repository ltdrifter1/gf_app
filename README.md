# Circle

**Find your Circle.** A premium gluten-free social network with an MSN
Messenger–style lounge — for people living with celiac disease and gluten
intolerance.

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

## Launch features

- **Community feed** — posts, comments, likes, saves, topics
- **Messenger** — buddy-list rooms, presence, typing indicators
- **Premium** — badge + Premium Lounge room ($9/mo, Stripe-ready or simulated)
- **Profiles** — presence, diagnosis, follower counts
