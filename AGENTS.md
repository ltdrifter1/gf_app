# Circle

Circle ("Find your Circle.") is a **gluten-free social network** with an MSN
Messenger–style chat lounge. Full-stack **Next.js 15** + **TypeScript** +
**Tailwind** + **Prisma**.

Design: glassmorphism with MSN gloss. Brand gradient: `bg-circle-gradient`.

## Surface

| Feature | Route |
|---------|-------|
| Landing | `/` |
| Auth | `/login`, `/register` |
| Community feed | `/app` |
| Public profiles | `/app/u/[username]` |
| Messenger | `/app/chat`, `/app/chat/[slug]` |
| Restaurants | `/app/restaurants` |
| Recipes | `/app/recipes` |
| Health (mental + physical) | `/app/health` |
| Saved / Search / Profile | `/app/saved`, `/app/search`, `/app/profile` |
| Admin | `/app/admin` |

## Cursor Cloud notes

- Dev: `npm run dev` → http://localhost:3000
- Local DB = SQLite (`DATABASE_URL="file:./dev.db"`). Production = Postgres.
- Reset: delete `prisma/dev.db` then `npx prisma db push && npx prisma db seed`
- Demo: `maya@circle.app` / `password123`
- Maps: MapLibre + OSM (no Mapbox key required)
- Chat/presence: HTTP polling (~2.5s); online = lastSeen < 60s
- DMs: `getOrCreateDm` creates non-community rooms
- Auth cookie: `gfc_session`
