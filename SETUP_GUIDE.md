# PGLife — Setup Guide

## What's inside
A full-stack PG booking platform built with:
- **Next.js 14** (App Router + TypeScript)
- **Tailwind CSS** for styling
- **Prisma 5** + **PostgreSQL** (via Supabase)
- **NextAuth.js** for authentication (4 roles)
- **Cloudinary** for image/video uploads
- **Razorpay** for payments (ready to integrate)

---

## Step 1 — Install dependencies

```bash
npm install
```

---

## Step 2 — Set up Supabase (free database)

1. Go to **supabase.com** → New Project
2. Name it `pglife`, pick region **South Asia (Mumbai)**
3. Wait ~2 min for it to provision
4. Go to **Settings → Database → Connection string → URI**
5. Copy the URI (looks like `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`)

---

## Step 3 — Create your .env file

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

**Required right now:**
- `DATABASE_URL` — your Supabase URI from Step 2
- `NEXTAUTH_SECRET` — any random 32+ char string (use https://generate-secret.vercel.app/32)
- `NEXTAUTH_URL` — `http://localhost:3000`

**Required before images work:**
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Get from: cloudinary.com → Dashboard (free account, 25GB)

**Required before payments work:**
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- Get from: razorpay.com → Settings → API Keys (test keys are free)

---

## Step 4 — Push database schema

```bash
npx prisma db push
```

You should see:
```
🚀  Your database is now in sync with your Prisma schema.
```

Then generate the Prisma client:
```bash
npx prisma generate
```

---

## Step 5 — Create your Admin account

After running the dev server, sign up at `/auth/signup` normally as a TENANT first.
Then go to your Supabase dashboard → Table Editor → `User` table → find your user → change `role` to `ADMIN` and `isApproved` to `true`.

---

## Step 6 — Run the development server

```bash
npm run dev
```

Open **http://localhost:3000** 🚀

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Homepage with city search |
| `/properties/bangalore` | PG listings for Bangalore |
| `/properties/bangalore/[id]` | PG detail page |
| `/auth/login` | Login |
| `/auth/signup` | Sign up (tenant / owner / broker) |
| `/dashboard` | Tenant dashboard |
| `/owner/dashboard` | Owner / broker dashboard |
| `/owner/listings/new` | Multi-step PG listing form |
| `/admin` | Admin panel (approve owners, verify PGs) |

---

## Deploy to Vercel

1. Push to GitHub
2. Go to vercel.com → Import Repository
3. Add all your `.env` variables in Project Settings → Environment Variables
4. Click Deploy

That's it — live in 3 minutes.

---

## Useful commands

```bash
npm run dev          # Start dev server
npx prisma db push   # Sync schema changes to DB
npx prisma studio    # Open visual DB editor
npx prisma generate  # Regenerate client after schema changes
```

---

## What to build next

- [ ] Razorpay payment flow (token booking)
- [ ] Google Maps embed on property detail
- [ ] Email notifications via Resend
- [ ] Review form on property detail page
- [ ] Search autocomplete on homepage
- [ ] Owner analytics (views, enquiries)

