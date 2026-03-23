<div align="center">
  
  <img src="https://github.com/cod-x-prince/pg-app/blob/main/public/icon.svg" alt="Gharam Logo" width="120" />

  # Gharam

  ### India's Trusted PG Booking Marketplace (Formerly PGLife)

  _Verified listings · Zero broker fees · Direct booking_

  [![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat-square&logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
  [![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://vercel.com)
  [![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C4B33?style=flat-square&logo=razorpay)](https://razorpay.com)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

  **[Live Demo](https://pg-app-i1h8.vercel.app)** · **[Report Bug](https://github.com/cod-x-prince/pg-app/issues)** · **[Request Feature](https://github.com/cod-x-prince/pg-app/issues)**

</div>

---

## 📋 Table of Contents

- [What is Gharam?](#what-is-gharam)
- [Problem & Solution](#problem--solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Team](#team)

---

## What is Gharam?

**Gharam** (formerly PGLife) is a two-sided marketplace for Paying Guest (PG) accommodations in India. It connects property owners with verified tenants, enabling seamless discovery, direct communication, and secure token bookings — all without broker interference.

Our platform is built natively for the Indian rental ecosystem, addressing trust gaps, fragmentation, and lack of transparency that tenants face daily.

---

## Problem & Solution

### The Problem
- **Fragmented market** — No centralized, reliable platform for PG listings.
- **Broker dominance** — Brokers charge 1–2 months' rent as fees, often with misleading information.
- **Fake listings** — Duplicate photos, incorrect amenities, and no accountability.
- **Zero trust** — No verification of owners or properties, leading to unsafe experiences.

### The Solution
- **Verified listings** — Every PG is manually reviewed by admins before going live.
- **Zero broker fees** — Direct owner-tenant interaction without middlemen.
- **Token booking system** — Hold a room with ₹500 token payment (adjustable against rent).
- **DigiLocker KYC** — Owners verify identity through India's official DigiLocker platform.
- **WhatsApp integration** — One-click chat with property owners.
- **Admin approval pipeline** — Ensures quality and trust across all listings.

---

## Key Features

### For Tenants
- 🔍 **Advanced Search & Filter** — City, price range, gender preference, amenities, ratings.
- 📞 **Direct Contact** — WhatsApp integration with pre-filled messages.
- 💳 **Token Booking** — Secure ₹500 payment via Razorpay to reserve a room.
- 🛡️ **Privacy Controls** — Full GDPR & DPDP Act 2023 compliance, with account deletion options.

### For Owners
- 📝 **6‑Step Listing Wizard** — Guided process: basic info, rooms, rules, food plans, photos, preview.
- ✅ **DigiLocker KYC** — Quick verification using official government ID.
- 📊 **Owner Dashboard** — Manage listings, view booking requests, track earnings.
- 🔔 **Automated Alerts** — Email notifications for bookings, approvals, and updates.

### For Admins
- 🕵️ **PG Approval Pipeline** — Review and approve new PGs before they become public.
- 👥 **User Management** — Verify owners, manage KYC status, assign verification badges.
- 📈 **Platform Oversight** — Monitor listings, bookings, and system health.

---

## Tech Stack

| Layer                | Technology                      | Purpose                                    |
| -------------------- | ------------------------------- | ------------------------------------------ |
| **Framework**        | Next.js 14.2.35 (App Router)    | Server‑side rendering, API routes, routing |
| **Language**         | TypeScript 5 (strict)           | Type safety, maintainability               |
| **Styling**          | Tailwind CSS + CSS Variables    | Responsive design, theming (Terracotta)    |
| **Database**         | PostgreSQL (Supabase)           | Relational data, session pooler            |
| **ORM**              | Prisma 5.22                     | Type‑safe database access, migrations      |
| **Authentication**   | NextAuth.js v4                  | Credentials + Google OAuth                 |
| **Image Storage**    | Cloudinary                      | Optimized images (AVIF/WebP)               |
| **Payments**         | Razorpay                        | Token booking payments (₹500)              |
| **Email**            | Resend                          | Transactional emails (4 templates)         |
| **Rate Limiting**    | Upstash Redis                   | Persistent rate limits across cold starts  |
| **CAPTCHA**          | Cloudflare Turnstile            | Invisible bot protection                   |
| **Deployment**       | Vercel                          | Continuous deployment, previews            |

---

## Getting Started

Follow these steps to set up Gharam locally.

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- PostgreSQL database (Supabase recommended)
- Cloudinary account (for image uploads)
- Razorpay account (for payments)
- Resend account (for emails)
- Cloudflare account (for Turnstile)
- Upstash Redis (for rate limiting)

### Installation

```bash
# Clone the repository
git clone https://github.com/cod-x-prince/pg-app.git
cd pg-app

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env

# Push database schema to your PostgreSQL instance
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed the database with initial data
npx tsx prisma/seed.ts

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."

# Resend
RESEND_API_KEY="..."

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY="..."
TURNSTILE_SECRET_KEY="..."

# Upstash Redis
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

> **Note:** Never commit `.env` files to version control. Add `.env` to `.gitignore`.

---

## Database Schema

Gharam uses Prisma with a PostgreSQL database. The schema consists of 9 models:

- **User** — Core user data, roles (tenant, owner, admin), KYC status.
- **PG** — Property listings, includes location, amenities, rules, etc.
- **Room** — Individual rooms within a PG, pricing, availability.
- **Booking** — Token booking records, payment status, timeline.
- **Payment** — Razorpay payment details.
- **Review** — Tenant ratings and feedback.
- **Amenity** — Predefined amenities list.
- **FoodPlan** — Meal options offered by PG.
- **Verification** — DigiLocker KYC records.

Run `npx prisma studio` to explore the schema visually.

---

## Deployment

The easiest way to deploy Gharam is to use **Vercel**. Follow these steps:

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add all environment variables from your `.env` file to Vercel's project settings.
4. Deploy with default settings (Vercel will detect Next.js).
5. Configure custom domain (if needed).

> **Important:** Ensure your Supabase PostgreSQL instance is accessible from Vercel's IP ranges. Use Supabase's session pooler connection string for production.

---

## Project Structure

```
pg-app/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Authenticated routes (dashboards, wizard)
│   │   │   ├── admin/           # Admin panel (PG approval, user management)
│   │   │   ├── dashboard/       # Owner dashboard
│   │   │   ├── listing/         # 6-step listing wizard
│   │   │   └── profile/         # User profile, KYC, account deletion
│   │   ├── (public)/            # Public routes
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── listings/        # Search & filter, property details
│   │   │   └── booking/         # Token booking flow
│   │   ├── api/                 # REST API routes (23 endpoints)
│   │   ├── privacy/             # DPDP Act 2023 compliant policy
│   │   └── terms/               # Terms of service (Indian law)
│   ├── components/              # Reusable UI components
│   │   ├── layout/              # Header, footer, etc.
│   │   ├── listings/            # Listing cards, filters
│   │   ├── booking/             # Booking modal, payment UI
│   │   └── shared/              # Buttons, forms, modals
│   ├── lib/                     # Utility libraries
│   │   ├── auth/                # NextAuth configuration
│   │   ├── prisma/              # Prisma client instance
│   │   ├── email/               # Resend email templates
│   │   ├── ratelimit/           # Upstash rate limiting
│   │   ├── turnstile/           # Cloudflare CAPTCHA verification
│   │   └── cloudinary/          # Image upload helpers
│   └── types/                   # Global TypeScript definitions
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── seed.ts                  # Seed script for development
│   └── migrations/              # Auto-generated migrations
├── scripts/                     # Utility scripts (health checks, etc.)
├── public/                      # Static assets
├── .env.example                 # Example environment variables
├── package.json
├── tsconfig.json
└── README.md
```

---

## API Routes

All API routes are located in `src/app/api/`. They are protected with authentication and rate limiting where necessary.

| Endpoint                        | Method | Description                       |
| ------------------------------- | ------ | --------------------------------- |
| `/api/auth/[...nextauth]`       | -      | NextAuth authentication           |
| `/api/listings`                 | GET    | Fetch paginated listings          |
| `/api/listings/[id]`            | GET    | Fetch single listing              |
| `/api/listings`                 | POST   | Create new listing (owner only)   |
| `/api/listings/[id]`            | PUT    | Update listing (owner/admin)      |
| `/api/bookings`                 | POST   | Create token booking              |
| `/api/bookings/[id]`            | GET    | Fetch booking details             |
| `/api/payments/create-order`    | POST   | Create Razorpay order             |
| `/api/payments/verify`          | POST   | Verify Razorpay payment           |
| `/api/admin/pending-pgs`        | GET    | List PGs awaiting approval (admin)|
| `/api/admin/verify-pg/[id]`     | POST   | Approve/reject PG (admin)         |
| `/api/user/kyc`                 | POST   | Submit DigiLocker KYC             |
| `/api/user/delete-account`      | DELETE | Permanently delete account        |

For detailed API documentation, refer to [API Docs](https://github.com/cod-x-prince/pg-app/wiki/API).

---

## Roadmap

- [x] Core marketplace — listings, search, filter, booking
- [x] Authentication — credentials + Google OAuth
- [x] Owner dashboard + 6-step listing wizard
- [x] Razorpay token booking (₹500)
- [x] Resend transactional emails (Gharam branded)
- [x] Cloudflare Turnstile CAPTCHA
- [x] User profile page with avatar upload & DigiLocker KYC
- [x] Admin Panel — PG Approval Pipeline & Owner verification
- [x] DPDP Act 2023 & CAN-SPAM compliance
- [ ] Date availability filter on listings
- [ ] WhatsApp notifications for owners (Twilio)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard for admins
- [ ] Multi-language support (Hindi, etc.)

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m 'Add some amazing feature'`.
4. Push to the branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

Please ensure your code passes linting and type checks (`npm run lint`, `npm run type-check`). For major changes, open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Team

Built with obsession in India by:

- **Parmbeer Singh** — [GitHub](https://github.com/cod-x-prince) · [LinkedIn](https://linkedin.com/in/parmbeer-singh)
- **Paras Jamwal** — [GitHub](https://github.com/parasjamwal) · [LinkedIn](https://linkedin.com/in/paras-jamwal)

Special thanks to all contributors and early testers who helped shape Gharam.

---

<div align="center">
  <strong>"Your perfect home awaits."</strong>
  <br /><br />
  Made with ❤️ for the Indian rental community.
</div>
