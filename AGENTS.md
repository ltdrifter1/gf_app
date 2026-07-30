# Circle

Circle ("Find your Circle.") is a **premium gluten-free social network** with an
MSN Messenger–style chat lounge. Full-stack **Next.js 15** (App Router) +
**TypeScript** + **Tailwind CSS** + **Prisma**.

Design language: glassmorphism with early-2000s MSN gloss (buttons, presence
dots, buddy-list chat). Brand gradient: `bg-circle-gradient`
(blue→violet→cyan); `.text-gradient` for wordmarks.

## Launch surface (keep it small)

| Feature | Route |
|---------|-------|
| Landing | `/` |
| Auth | `/login`, `/register` |
| Community feed | `/app` |
| Post detail | `/app/post/[id]` |
| Messenger | `/app/chat`, `/app/chat/[slug]` |
| Saved | `/app/saved` |
| Search (posts/people/rooms) | `/app/search` |
| Profile | `/app/profile` |
| Premium | `/app/premium` |
| Admin (ADMIN only) | `/app/admin` |

Intentionally **not** in v1: restaurants/maps, recipes, products, mental health,
AI assistant, travel, experts, community events map.

## Cursor Cloud specific instructions

### Running the app
- Dev server: `npm run dev` → http://localhost:3000 (single Next.js process;
  no separate backend).
- Scripts: `npm run build`, `npm run lint`, `npm run typecheck`.

### Database
- **Local = SQLite** (`DATABASE_URL="file:./dev.db"`). **Production = Postgres /
  Supabase** — switch `provider` in `prisma/schema.prisma`.
- Reset: `npm run db:reset`.
- After schema edits: `npx prisma db push` then restart `npm run dev`.
- `.env` is gitignored; copy from `.env.example` if missing.

### Demo accounts (password `password123`)
- `maya@circle.app` — Premium member
- `admin@circle.app` — Admin
- Others: `sara@`, `leo@`, `theo@`, `priya@` @circle.app

### Optional integrations
- **Premium / Stripe**: if `STRIPE_SECRET_KEY` is set, wire Checkout in
  `src/lib/actions/premium.ts`; otherwise upgrade is simulated and unlocks
  the Premium Lounge room.

### Real-time chat & presence
- HTTP polling (messages ~2.5s, presence heartbeat). No WebSocket server.
- Online = `lastSeen` within last 60s.
- Premium rooms (`ChatRoom.isPremium`) redirect non-premium users to `/app/premium`.

### Auth
- Cookie/JWT session (`src/lib/auth.ts`, `jose` + `bcryptjs`). Cookie: `gfc_session`.
- `/app/*` requires a session.
