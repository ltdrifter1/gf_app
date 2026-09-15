# Lumen

**Your gluten-free companion. Find your people — and a little more light.**

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

Local demo login (dev only): `maya@lumen.app` / `password123`

Password reset: set `RESEND_API_KEY` (and `EMAIL_FROM`) to email links. If those
are missing, `/forgot` still creates a one-hour token and shows the link on the
page so accounts are never stuck.

## Ship to production

See **[DEPLOY.md](./DEPLOY.md)** — Postgres + Vercel + Namecheap DNS for **https://safelyceliac.com**
(current host; product name is **Lumen**).  
Catalog boots safely without demo accounts (`npm run db:seed:prod` or auto on first request).

## Features

- **Community feed** — All / Following (Following is only people you follow — never your own posts)
- **Messenger** — buddy list with meaningful statuses, DMs, community + city “dining tonight” rooms, presence, buddy match
- **Restaurants** — pending review, city filters, list/map tabs (CARTO tiles), `?lat&lng` distance, visit-based trust (claims capped)
- **Recipes** — search, sort, ratings, kid-friendly filter
- **Health** — mental / physical library, caregiver pack, glutening recovery card, private insights
- **Label scan** — `/app/scan` photo, barcode (Open Food Facts), or paste (heuristic, not lab-grade)
- **GF cost tracker** — `/app/costs` Canadian medical-expense-style CSV (not tax advice)
- **Account** — forgot/reset password, ZIP export, delete account, notification quiet hours
- **Safety** — HTTPS-only images in `<img>`; Scan + Costs in the app sidebar
- **PWA** — installable; in-tab notifications; Web Push when VAPID is set
- **Profiles** — MySpace-style public pages with Profile Studio (skins, wallpaper, Top 8, guestbook)
- **Privacy / Terms** — `/privacy`, `/terms`
