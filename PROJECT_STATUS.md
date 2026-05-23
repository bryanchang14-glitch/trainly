# Trainly — Project Status

Live site: <https://trainly-sg.vercel.app>

This doc captures the *current* state so collaborators can pick up without
re-deriving context. If you're a Claude/AI pairing with someone on this
project, **read this file first.**

---

## 🌐 Where things live

| Thing | Location |
|---|---|
| Live site | https://trainly-sg.vercel.app |
| GitHub repo | https://github.com/bryanchang14-glitch/trainly |
| Hosting | Vercel — auto-deploys on push to `master` |
| Database | Neon Postgres (Singapore region, free tier) |
| Local code | `C:\Users\bryan\trainly` (Bryan's laptop) or wherever Cherrelle cloned |

## 🔑 Owner accounts

Both have OWNER role. Passwords are private — keep them out of chat.

- `bryanchang14@gmail.com`
- `cherrelletqrwork@gmail.com`

Coach/client demo accounts (`aisha@trainly.com`, `sarah@demo.com`, etc., all
password `password123`) still exist from the original seed.

## ✅ What's shipped

**Core marketplace (built day 1):**
- Landing page with sage + coral brand palette
- Coach discovery with filters (specialty, format, price, search)
- AI Match wizard (10-step quiz with weighted scoring)
- Coach profiles, packages, reviews, gallery, certifications
- Booking flow (date, time, format, notes, packages)
- Client dashboard (upcoming/past, progress charts, favourites)
- Coach dashboard (requests, KPIs, inline profile editor)
- 1:1 chat with polling updates
- JWT cookie auth, bcrypt passwords

**Day-2 additions (mostly Cherrelle):**
- AI chatbot widget ("Ask Trainly", canned mode, ready to upgrade to Claude/Gemini)
- Profile editing for clients and coaches (avatar upload + URL, bio, location)
- Self-service account deletion (email-confirmed)
- OWNER role + `/owner` admin dashboard with:
  - KPIs, recent bookings, all-users table, coaches at a glance
  - Add new coach (`/owner/coaches/new`)
  - List all coaches (`/owner/coaches`)
  - Edit ALL homepage wordings (`/owner/site`) — hero, stats, trust/insurance,
    footer, etc. with collapsible accordion editor
- Editable + clickable footer
- New Trainly logo (designed by Cherrelle, cropped to circular mark)

## 🛠️ Known issues to fix (low-priority)

1. **MEDIUM:** `/api/admin/setup-owners` endpoint should be locked to one-shot
   (only works when zero OWNER accounts exist). Currently anyone with the
   AUTH_SECRET can wipe + recreate owner accounts. Not critical (AUTH_SECRET
   leak is already game over for JWT signing), but easy to harden.

2. **MINOR:** `BIO_MAX` (500) and `NAME_MAX` (80) are duplicated between
   `src/app/actions.ts` (server) and `src/components/user-profile-editor.tsx`
   (client). Move to a shared `src/lib/limits.ts`.

3. **MINOR:** Claude model name in `src/lib/chatbot.ts` is set to
   `claude-haiku-4-5`. Verify against current Anthropic docs before
   enabling real-AI mode by setting `ANTHROPIC_API_KEY`. The fallback
   to canned responses will catch any 404 gracefully, so this won't break.

4. **LATER:** Avatars are stored as base64 data URLs (≤200KB each) in the
   `User.avatarUrl` Postgres column. Fine at MVP scale (~10 users). At
   ~1000+ users, switch to image hosting (Vercel Blob, Cloudinary, S3) and
   store URLs only.

## 📅 Queued / next up

**Stripe payments (deferred from 2026-05-23):**
Full Stripe Checkout + Connect — clients pay via Checkout, Stripe auto-splits
85% to coach's Connect account and 15% to Trainly as platform fee.

Plan:
1. Schema: add `Coach.stripeAccountId`, `stripeOnboarded`,
   `stripeChargesEnabled`, and `Booking.stripeSessionId`,
   `stripePaymentIntentId`, `stripePaidAt`. Add `PENDING_PAYMENT`
   booking status.
2. `npm install stripe`, add lib wrapper at `src/lib/stripe.ts`
3. API routes:
   - `POST /api/stripe/checkout` — create Checkout session for a booking
   - `POST /api/stripe/connect/onboard` — generate Stripe Express link for coach
   - `GET  /api/stripe/connect/return` — refresh coach onboarding status
   - `POST /api/stripe/webhook` — handle Stripe events
4. UI: redirect booking form to Stripe Checkout, add "Set up payouts" card on
   coach dashboard, build `/booking/[id]/confirm` page
5. Env vars needed (set in Vercel): `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`
6. User work: sign up at <https://dashboard.stripe.com/register>, activate
   Connect, grab test API keys, configure webhook endpoint

Estimated total: ~60 min code + ~30 min Stripe setup with user.

## 🧰 Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Prisma + Postgres (Neon)
- Tailwind CSS · Server Actions
- JWT cookie auth (`jose`) + bcrypt
- Optional: Anthropic API for real chatbot (currently canned)

## 🚀 Local dev

```bash
# Clone (Cherrelle, on a fresh machine):
gh repo clone bryanchang14-glitch/trainly
cd trainly
npm install

# .env file needs DATABASE_URL + DIRECT_URL + AUTH_SECRET
# (get current values from Vercel → Project Settings → Environment Variables)
# Note: AUTH_SECRET in Vercel is marked Sensitive and can't be viewed
# after creation — if needed, rotate it to a new known value.

npx prisma generate
npm run dev
# → http://localhost:3000 (talks to the same Neon DB as production)
```

## 🤝 Workflow

- Cherrelle works on a fork (`cherrelletqrwork-png/trainly`)
- Opens PRs against `bryanchang14-glitch/trainly:master`
- Bryan reviews + merges
- Vercel auto-deploys on master push

Any push to master deploys live within ~90 seconds. **There is no staging
environment** — be careful with destructive schema changes.
