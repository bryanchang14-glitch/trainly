# Trainly

The verified marketplace for freelance fitness & wellness professionals in Singapore.
Live demo (after you deploy): `https://YOUR-DEPLOY.vercel.app`

## Local development

```bash
npm install
# Paste your Neon Postgres URL into .env (DATABASE_URL + DIRECT_URL)
npx prisma db push
curl http://localhost:3000/api/admin/seed?token=$AUTH_SECRET   # OR: npm run db:seed
npm run dev
```

Open http://localhost:3000

## Demo accounts (after seeding)

All passwords: `password123`

**Clients**
- `sarah@demo.com` — has confirmed booking, pending request, past session, progress data
- `marcus@demo.com`

**Coaches**
- `aisha@trainly.com` — Yoga & Pilates, Tanjong Pagar (has a pending request to review)
- `ravi@trainly.com` — Personal Training, Bishan
- `mei@trainly.com` — Physiotherapy, Tampines
- Plus 5 more: Javier (running), Priya (nutrition), Daniel (kids), Nadia (boxing), William (seniors)

## Deploy to Vercel + Neon

1. **Create a free Neon Postgres**: <https://neon.tech> → New Project → copy both the **pooled** and **direct** connection strings.
2. **Create a public GitHub repo** with this code (we already initialized git).
3. **Connect to Vercel**: <https://vercel.com/new> → Import your repo.
4. **Set environment variables** in Vercel Project Settings:
   - `DATABASE_URL` — Neon pooled URL (with `?sslmode=require`)
   - `DIRECT_URL` — Neon direct URL
   - `AUTH_SECRET` — `openssl rand -hex 32`
5. **Push your schema** (one-time, from your laptop):
   ```bash
   npx prisma db push
   ```
6. **Seed the live database** by hitting the one-shot endpoint:
   ```bash
   curl "https://YOUR-DEPLOY.vercel.app/api/admin/seed?token=YOUR_AUTH_SECRET"
   ```

That's it. Every push to `main` auto-deploys.

## Tech

- Next.js 16 (App Router) + React 19
- Prisma + Postgres (Neon)
- Tailwind CSS · Server Actions
- JWT cookie auth (`jose`) + bcrypt

## Routes

- `/` — Landing
- `/coaches` — Browse with filters
- `/coaches/[slug]` — Coach profile + booking
- `/match` — AI Match wizard
- `/chat` — Conversations
- `/dashboard` — Client dashboard
- `/coach` — Coach dashboard
- `/login`, `/signup` — Auth
- `/api/admin/seed?token=$AUTH_SECRET` — One-shot DB seed (idempotent)
