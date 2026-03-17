<div align="center">

<br/>

```
██████╗  ██████╗ ██╗     ██╗███████╗███████╗
██╔══██╗██╔════╝ ██║     ██║██╔════╝██╔════╝
██████╔╝██║  ███╗██║     ██║█████╗  █████╗
██╔═══╝ ██║   ██║██║     ██║██╔══╝  ██╔══╝
██║     ╚██████╔╝███████╗██║██║     ███████╗
╚═╝      ╚═════╝ ╚══════╝╚═╝╚═╝     ╚══════╝
```

**India's premium PG booking marketplace**

_Verified listings · Real photos · Direct booking · Zero broker fees_

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)]()

<br/>

[**Live Demo**](https://pg-app-i1h8.vercel.app) · [**Report Bug**](https://github.com/cod-x-prince/pg-app/issues) · [**Request Feature**](https://github.com/cod-x-prince/pg-app/issues)

<br/>

</div>

---

## What is PGLife?

PGLife is a two-sided marketplace for Paying Guest (PG) accommodation in India. Owners list verified PGs, tenants discover and book them — with token payments, WhatsApp integration, and a trust-first experience built natively for the Indian rental market.

**The problem:** Finding a trustworthy PG in Indian cities is fragmented, opaque, and dominated by brokers charging 1–2 months rent. Most listings are fake, photos are recycled, and there is zero accountability.

**The solution:** Verified listings with real photos, direct owner contact via WhatsApp, token booking to hold rooms, and a review system that only allows verified tenants to write reviews.

---

## Design System

Built with a dark luxury aesthetic — designed to stand apart from generic real estate platforms.

| Token           | Value                    | Usage                |
| --------------- | ------------------------ | -------------------- |
| `--ink`         | `#0A0A0F`                | Primary background   |
| `--ink2`        | `#12121A`                | Secondary surfaces   |
| `--gold`        | `#C9A84C`                | Accent, CTAs, badges |
| `--gold-light`  | `#F0D080`                | Shimmer, gradients   |
| `--border`      | `rgba(255,255,255,0.08)` | All borders          |
| `--border-gold` | `rgba(201,168,76,0.25)`  | Highlighted borders  |

**Typography:** [Cinzel](https://fonts.google.com/specimen/Cinzel) (headings) + [Josefin Sans](https://fonts.google.com/specimen/Josefin+Sans) (body)

**Effects:** Liquid glass morphism · Gold shimmer text · 3D tilt cards · Ambient glow blobs · Cinematic page loader · Magnetic cursor · Bento grid layout

---

## Features

### For Tenants

- City-based search with premium command palette — autocomplete, keyboard navigation, city tags
- Property galleries with lightbox, keyboard navigation, and CLS-free loading
- WhatsApp direct contact with pre-filled messages
- Token booking (₹500 via Razorpay) to hold a room instantly
- Verified reviews — only tenants with confirmed bookings can review
- Save/favourite properties with instant-fill heart button
- Sticky mobile CTA bar — Book Now + WhatsApp always visible

### For Owners

- 5-step listing wizard — name, rooms, photos, amenities, preview
- Cloudinary image upload — sequential, crash-safe, auto-optimized
- Owner dashboard — booking requests, confirm/decline, delete listings
- Email notifications via Resend — new bookings + approval alerts
- Verified badge — admin-reviewed verification

### For Platform

- Admin panel — approve owners, verify/delist properties, live stats
- Dynamic sitemap — auto-generated for all active listings
- Fully responsive — mobile-first with slide-up filter drawer
- Anti-bot CAPTCHA — Cloudflare Turnstile on signup

---

## Tech Stack

| Layer            | Technology                   | Notes                            |
| ---------------- | ---------------------------- | -------------------------------- |
| Framework        | Next.js 14 App Router        | Force-dynamic API routes         |
| Language         | TypeScript 5 (strict)        | Central types in `@/types`       |
| Styling          | Tailwind CSS + CSS Variables | Dark luxury design system        |
| Database         | PostgreSQL via Supabase      | Session pooler for Vercel        |
| ORM              | Prisma 5.22                  | CUID IDs, 12 indexes             |
| Auth             | NextAuth.js v4               | JWT + credentials + Google OAuth |
| Images           | Cloudinary                   | AVIF/WebP auto-optimization      |
| Payments         | Razorpay                     | ₹500 token booking flow          |
| Email            | Resend                       | 4 transactional templates        |
| Rate Limiting    | Upstash Redis                | Persistent across cold starts    |
| Error Monitoring | Sentry                       | Client + server + edge           |
| Analytics        | Vercel Analytics             | Anonymous page views             |
| CAPTCHA          | Cloudflare Turnstile         | Managed (smart, invisible)       |
| Deployment       | Vercel                       | Edge network, auto-deploy        |

---

## Architecture

```
pglife/
├── src/
│   ├── app/
│   │   ├── (public)/           # Homepage, listings, property detail
│   │   ├── (auth)/             # Dashboards, admin, listing wizard
│   │   ├── api/                # 23 REST API routes (all force-dynamic)
│   │   │   ├── auth/           # NextAuth + signup (Turnstile protected)
│   │   │   ├── properties/     # CRUD + rooms/images/amenities/like
│   │   │   ├── bookings/       # Tenant bookings + owner management
│   │   │   ├── payments/       # Razorpay create-order + verify
│   │   │   ├── email/          # Resend transactional triggers
│   │   │   ├── admin/          # Owner approval + property verification
│   │   │   └── stats/          # Platform stats (1hr edge cache)
│   │   ├── privacy/            # DPDP Act 2023 compliant
│   │   └── terms/              # 12-section ToS, Indian law
│   ├── components/
│   │   ├── layout/             # Navbar (float glass), Footer (dark)
│   │   ├── properties/         # PropertyCard (3D tilt), FilterPanel,
│   │   │                         GalleryClient, StarRating
│   │   ├── booking/            # BookingForm (Razorpay + WhatsApp)
│   │   ├── home/               # HeroSearch (command palette)
│   │   └── ui/                 # CustomCursor, PageLoader, TurnstileWidget,
│   │                             TiltCard
│   ├── lib/
│   │   ├── auth.ts             # NextAuth + Google OAuth + rate limit
│   │   ├── email.ts            # Resend service (4 templates)
│   │   ├── handler.ts          # withHandler() — global error wrapper
│   │   ├── rateLimit.ts        # Upstash Redis sliding window
│   │   ├── schemas.ts          # Zod validation (all API routes)
│   │   ├── turnstile.ts        # Cloudflare verification (fail-open)
│   │   └── prisma.ts           # Singleton with connection pooling
│   └── types/
│       └── index.ts            # SessionUser, PropertyListItem, Booking, etc.
├── prisma/
│   ├── schema.prisma           # 9 models, 12 indexes, cuid IDs
│   ├── seed.ts                 # 7 users, 7 properties, reviews
│   └── seed-reviews.ts         # Force-seed for existing properties
└── public/
    ├── og-image.svg            # 1200×630 OG image (dark luxury)
    └── icon.svg                # Favicon
```

---

## Security

| Category         | Implementation                                        |
| ---------------- | ----------------------------------------------------- |
| SQL Injection    | Prisma parameterized queries — zero raw SQL           |
| Authentication   | bcrypt cost 12, JWT, constant-time login              |
| Authorization    | Role-based (TENANT/OWNER/BROKER/ADMIN) on every route |
| Input Validation | Zod schemas on all 23 API routes                      |
| Mass Assignment  | `.strict()` on update schemas, field whitelists       |
| Rate Limiting    | Upstash Redis — persists across Vercel instances      |
| CAPTCHA          | Cloudflare Turnstile on signup — blocks bots          |
| File Uploads     | Type whitelist, size limits, user folder isolation    |
| Security Headers | CSP, X-Frame-Options, X-Content-Type, Referrer-Policy |
| Error Handling   | `withHandler()` — no stack traces exposed to clients  |
| ID Format        | Prisma CUID — not sequential, not guessable           |

---

## Getting Started

### Prerequisites

- Node.js 20+
- [Supabase](https://supabase.com) project (free tier works)
- [Cloudinary](https://cloudinary.com) account (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/cod-x-prince/pg-app.git
cd pg-app
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Supabase
DATABASE_URL="postgresql://postgres.REF:PASS@pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&prepare=false"
DIRECT_URL="postgresql://postgres.REF:PASS@pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""

# Upstash Redis
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Optional — activates features when present
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
RESEND_API_KEY=""
RESEND_FROM_EMAIL="onboarding@resend.dev"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""
```

### 3. Database setup

```bash
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
```

### 4. Run

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Set your account as admin

Supabase → Table Editor → `User` → your row → set `role = ADMIN`, `isApproved = true`

---

## Test Accounts (after seeding)

| Email               | Password       | Role             |
| ------------------- | -------------- | ---------------- |
| `admin@pglife.in`   | `Admin@2026`   | Admin            |
| `owner1@pglife.in`  | `Owner@2026`   | Owner (approved) |
| `tenant1@pglife.in` | `Tenant@2026`  | Tenant           |
| `pending@pglife.in` | `Pending@2026` | Owner (pending)  |

---

## Scripts

```bash
npm run dev              # Development server
npm run build            # Production build
npm run start            # Production server
npx prisma db push       # Push schema changes
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # DB GUI
npx tsx prisma/seed.ts   # Seed test data
npx tsx scripts/health-check.ts https://your-url.vercel.app  # Production health check
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com) → New Project
3. Add all environment variables
4. Deploy
5. Update `NEXTAUTH_URL` to your Vercel domain → Redeploy

> **Important:** `DATABASE_URL` must end with `?pgbouncer=true&connection_limit=1&prepare=false` for Supabase connection pooling on Vercel serverless.

---

## Roadmap

- [x] Core marketplace — listings, search, filter, detail
- [x] Authentication — credentials + Google OAuth
- [x] Owner dashboard + 5-step listing wizard
- [x] Admin panel — owner approval, property verification
- [x] Image gallery with lightbox and CLS elimination
- [x] Razorpay token booking (₹500)
- [x] Resend transactional emails (4 templates)
- [x] Cloudflare Turnstile CAPTCHA
- [x] Upstash Redis rate limiting
- [x] Sentry error monitoring
- [x] Dark luxury redesign — Cinzel/Josefin, liquid glass, bento grid
- [x] Type safety — central types, eradicate `any`
- [x] Mobile filter drawer + sticky booking bar
- [x] Privacy Policy + Terms of Service (DPDP Act 2023)
- [x] Production health check script (38 routes)
- [ ] Razorpay live keys + KYC
- [ ] Resend domain verification (pglife.in)
- [ ] Google Maps embed on property detail
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] City expansion — Chennai, Kolkata, Srinagar

---

## Cities

Bangalore · Mumbai · Delhi · Hyderabad · Chennai · Kolkata · Pune · Jammu · Srinagar

---

## Contributing

This is a startup. Security vulnerabilities should be reported privately to prince@pglife.in — not opened as public issues.

---

## License

Private — all rights reserved. © 2026 PGLife.

---

<div align="center">

Built with obsession in India by [Prince Jamwal](https://github.com/cod-x-prince) & Paras Jamwal

_"Your perfect home awaits you."_

</div>
