<div align="center">

# PGLife

**India's modern PG booking marketplace**

Connect tenants with verified PG accommodations across India.
Built for the Indian market — WhatsApp-first, mobile-ready, production-grade.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

[Live Demo](https://pglife.in) · [Report Bug](https://github.com/cod-x-prince/pglife/issues) · [Request Feature](https://github.com/cod-x-prince/pglife/issues)

</div>

---

## What is PGLife?

PGLife is a two-sided marketplace for Paying Guest (PG) accommodation in India. Owners list verified PGs, tenants discover and book them — with token payments, WhatsApp integration, and a trust-first experience built for the Indian rental market.

**The problem**: Finding a trustworthy PG in Indian cities is fragmented, opaque, and dominated by brokers. Most listings are fake, photos are recycled, and there's no accountability.

**The solution**: Verified listings with real photos, direct owner contact, token booking to hold rooms, and a review system that only allows verified tenants to write reviews.

---

## Features

### For Tenants

- 🔍 **City-based search** with filters — gender, rent range, amenities
- 🏠 **Property galleries** — lightbox with keyboard navigation, thumbnail strip
- 💬 **WhatsApp direct contact** — pre-filled message to owner
- 📅 **Token booking** — pay a small token via Razorpay to hold a room
- ⭐ **Verified reviews** — only tenants with confirmed bookings can review
- 💾 **Save listings** — Like/save properties for later

### For Owners

- 📝 **5-step listing wizard** — name, rooms, photos, amenities, preview
- 📸 **Cloudinary image upload** — drag & drop, auto-optimized
- 📊 **Dashboard** — booking requests, confirm/decline, analytics
- 🔔 **Email notifications** — instant alerts for new bookings via Resend
- ✅ **Verified badge** — admin-reviewed verification for trust signal

### For Platform

- 🛡️ **Admin panel** — approve owners, verify/delist properties
- 📈 **Live platform stats** — properties, bookings, tenants, avg rating
- 🗺️ **Dynamic sitemap** — auto-generated for all active listings
- 📱 **Fully responsive** — mobile-first design

---

## Tech Stack

| Layer                | Technology                                           |
| -------------------- | ---------------------------------------------------- |
| **Framework**        | Next.js 14 (App Router)                              |
| **Language**         | TypeScript 5 (strict mode)                           |
| **Styling**          | Tailwind CSS + DM Sans + Playfair Display            |
| **Database**         | PostgreSQL via Supabase                              |
| **ORM**              | Prisma 5 (with migrations)                           |
| **Auth**             | NextAuth.js v4 (JWT + credentials)                   |
| **Images**           | Cloudinary (auto-optimize to AVIF/WebP)              |
| **Payments**         | Razorpay (token booking)                             |
| **Email**            | Resend (transactional)                               |
| **Rate Limiting**    | Upstash Redis (persistent across Vercel cold starts) |
| **Error Monitoring** | Sentry (client + server + edge)                      |
| **Deployment**       | Vercel (edge network)                                |
| **SEO**              | Dynamic sitemap, OG tags, robots.txt                 |

---

## Architecture

```
pglife/
├── src/
│   ├── app/
│   │   ├── (public)/          # Homepage, property listings, detail pages
│   │   ├── (auth)/            # Protected: dashboards, admin, listing wizard
│   │   ├── api/               # 23 REST API routes
│   │   │   ├── auth/          # NextAuth + signup
│   │   │   ├── properties/    # CRUD + rooms/images/videos/amenities/like
│   │   │   ├── bookings/      # Tenant bookings + owner management
│   │   │   ├── reviews/       # Verified reviews
│   │   │   ├── payments/      # Razorpay order creation + verification
│   │   │   ├── admin/         # Owner approval + property verification
│   │   │   ├── upload/        # Cloudinary file upload
│   │   │   └── stats/         # Platform-wide stats (1hr cache)
│   │   └── auth/              # Login, signup, pending pages
│   ├── components/
│   │   ├── layout/            # Navbar (scroll-aware), Footer
│   │   ├── properties/        # PropertyCard, GalleryClient, FilterPanel, StarRating
│   │   ├── booking/           # BookingForm with Razorpay integration
│   │   └── home/              # HeroSearch
│   └── lib/
│       ├── auth.ts            # NextAuth config + rate limiting
│       ├── handler.ts         # withHandler() — global error wrapper + Sentry
│       ├── rateLimit.ts       # Upstash Redis rate limiter
│       ├── schemas.ts         # Zod validation schemas (all 12 routes)
│       ├── validation.ts      # Field validators + whitelists
│       ├── prisma.ts          # Prisma singleton (connection pooling)
│       ├── cloudinary.ts      # Cloudinary config
│       └── email.ts           # Resend email templates
├── prisma/
│   ├── schema.prisma          # 9 models, 12 indexes, composite unique constraints
│   ├── seed.ts                # Full test data seed (7 users, 7 properties)
│   └── seed-reviews.ts        # Force-seed reviews for existing properties
└── instrumentation.ts         # Sentry server/edge initialization
```

---

## Security

PGLife is built with a security-first approach:

| Category             | Implementation                                                    |
| -------------------- | ----------------------------------------------------------------- |
| **SQL Injection**    | Prisma parameterized queries throughout — zero raw SQL            |
| **Authentication**   | bcrypt cost 12, JWT sessions, constant-time login                 |
| **Authorization**    | Role-based (TENANT/OWNER/BROKER/ADMIN) on every route             |
| **Input Validation** | Zod schemas on all 12 API routes                                  |
| **Mass Assignment**  | `.strict()` on update schemas, field whitelists                   |
| **Rate Limiting**    | Upstash Redis — persistent across Vercel function instances       |
| **File Uploads**     | Type whitelist, size limits, user folder isolation on Cloudinary  |
| **Security Headers** | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy     |
| **Error Handling**   | `withHandler()` wraps all routes — no stack traces exposed        |
| **Secrets**          | All credentials in environment variables, never in code           |
| **DB Indexes**       | 12 indexes on high-frequency query columns                        |
| **Soft Deletes**     | `isActive: false` — no data loss, maintains referential integrity |

---

## Database Schema

```prisma
User        → role: TENANT | OWNER | BROKER | ADMIN
Property    → city, gender, isVerified, isActive + 7 indexes
Room        → type, rent, deposit, isAvailable
Booking     → status: PENDING | CONFIRMED | CANCELLED | COMPLETED
Review      → @@unique([tenantId, propertyId]) — no duplicate reviews
Image       → Cloudinary URLs, isPrimary flag
Amenity     → whitelisted values only
Like        → @@unique([userId, propertyId]) — no duplicate likes
```

---

## API Routes

```
POST   /api/auth/signup                  Create account
GET    /api/auth/[...nextauth]           NextAuth session/providers
POST   /api/auth/[...nextauth]           Sign in/out

GET    /api/properties                   List (paginated, filtered)
POST   /api/properties                   Create listing
GET    /api/properties/[id]              Property detail
PUT    /api/properties/[id]              Update listing
DELETE /api/properties/[id]              Soft delete

POST   /api/properties/[id]/rooms        Add room type
POST   /api/properties/[id]/images       Add image
POST   /api/properties/[id]/videos       Add video
POST   /api/properties/[id]/amenities    Add amenity (whitelist enforced)
GET    /api/properties/[id]/like         Check like status
POST   /api/properties/[id]/like         Toggle like

GET    /api/bookings                     Tenant's bookings
POST   /api/bookings                     Create booking
PUT    /api/bookings/[id]                Update status (owner only)
GET    /api/owner/bookings               Owner's incoming bookings

POST   /api/reviews                      Create review (confirmed booking required)
POST   /api/upload                       Upload to Cloudinary
GET    /api/stats                        Platform stats (1hr edge cache)

GET    /api/admin/owners                 Pending approvals
PUT    /api/admin/owners/[id]            Approve/reject owner
PUT    /api/admin/properties/[id]        Verify/delist property

POST   /api/payments/create-order        Razorpay order
POST   /api/payments/verify              Verify payment signature
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Cloudinary](https://cloudinary.com) account (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/cod-x-prince/pglife.git
cd pglife
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in `.env` — the required variables:

```env
# Supabase — get from Settings → Database → Connection string
DATABASE_URL="postgresql://postgres.YOUR_REF:PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&prepare=false"
DIRECT_URL="postgresql://postgres.YOUR_REF:PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"

# NextAuth — generate secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary — from cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""

# Upstash Redis — from upstash.com → Create Database
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Sentry — from sentry.io → Create Project → Next.js
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""
```

### 3. Set up database

```bash
# Push schema to Supabase
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed test data (optional)
npx tsx prisma/seed.ts
```

### 4. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Set up admin account

Go to Supabase → Table Editor → `User` table → find your email row → set:

- `role` = `ADMIN`
- `isApproved` = `true`

Then visit [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Test Accounts (after seeding)

| Email             | Password     | Role                     |
| ----------------- | ------------ | ------------------------ |
| admin@pglife.in   | Admin@2026   | Admin                    |
| owner1@pglife.in  | Owner@2026   | Owner (approved)         |
| tenant1@pglife.in | Tenant@2026  | Tenant                   |
| pending@pglife.in | Pending@2026 | Owner (pending approval) |

---

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to [Vercel](https://vercel.com) → New Project
3. Add all environment variables from `.env`
4. Deploy
5. Update `NEXTAUTH_URL` to your Vercel domain
6. Redeploy

### Environment variables for production

Add `?pgbouncer=true&connection_limit=1&prepare=false` to `DATABASE_URL` — required for Supabase connection pooling on Vercel serverless functions.

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npx prisma db push   # Push schema changes
npx prisma generate  # Regenerate Prisma client
npx prisma studio    # Open Prisma Studio (DB GUI)
npx tsx prisma/seed.ts  # Seed test data
```

---

## Cities Supported

Bangalore · Mumbai · Delhi · Hyderabad · Chennai · Kolkata · Pune · Jammu · Srinagar

---

## Roadmap

- [x] Core marketplace (listings, search, filter)
- [x] Authentication (signup, login, role-based access)
- [x] Owner dashboard + listing wizard
- [x] Admin panel (owner approval, property verification)
- [x] Image gallery with lightbox
- [x] Zod validation on all API routes
- [x] Upstash Redis rate limiting
- [x] Sentry error monitoring
- [x] Dynamic sitemap + SEO
- [ ] Razorpay token booking (in progress)
- [ ] Email notifications via Resend
- [ ] Google OAuth
- [ ] Cloudflare Turnstile CAPTCHA
- [ ] Review submission UI
- [ ] Google Maps embed
- [ ] Mobile app (React Native)

---

## Contributing

This is a startup project. If you find a security vulnerability, please email prince@pglife.in rather than opening a public issue.

For feature requests and bugs, open an issue.

---

## License

Private — all rights reserved. © 2026 PGLife.

---

<div align="center">

Built with ❤️ in India by [Prince Jamwal](https://github.com/cod-x-prince) & Paras Jamwal

_"Find your home away from home"_

</div>
