# Gharam (PGLife) - Copilot Instructions

## Project Overview

Gharam is a **Next.js 14 (App Router)** marketplace for Paying Guest (PG) accommodations in India. It connects property owners with tenants, featuring verified listings, token bookings, and admin approval workflows.

**Core Tech Stack:**
- Next.js 14.2.35 with TypeScript (strict mode)
- Prisma 5.22 + PostgreSQL (Supabase)
- NextAuth.js v4 (credentials + Google OAuth)
- Tailwind CSS 4.2
- Razorpay (payments), Resend (emails), Cloudinary (images)
- Upstash Redis (rate limiting), Cloudflare Turnstile (CAPTCHA)
- Sentry (error tracking)

## Build, Test, and Lint Commands

```bash
# Development
npm run dev                  # Start dev server on :3000

# Build & Deploy
npm run build                # Prisma generate → Next.js build
npm start                    # Production server

# Linting
npm run lint                 # ESLint (typescript-eslint config)
npx tsc --noEmit             # Type check without emitting files

# Database
npm run db:push              # Push schema to database (no migrations)
npm run db:studio            # Open Prisma Studio GUI
npm run db:generate          # Generate Prisma Client
npm run db:seed              # Seed database with initial data
```

**Note:** There are no test scripts configured. The project uses manual testing and type checking.

## Architecture & Key Conventions

### Route Structure (App Router)

The app uses Next.js 14 App Router with route groups:

```
src/app/
├── (auth)/                  # Protected routes - requires authentication
│   ├── admin/               # Admin-only routes (PG approvals, user management)
│   ├── dashboard/           # Owner dashboard
│   ├── owner/               # Owner-specific pages (listings wizard)
│   └── profile/             # User profile, KYC, account deletion
├── (public)/                # Public routes - no auth required
│   ├── page.tsx             # Homepage
│   ├── listings/            # Search, filter, property details
│   └── booking/             # Token booking flow
├── api/                     # REST API routes (23+ endpoints)
│   ├── admin/               # Admin operations
│   ├── auth/                # NextAuth, signup
│   ├── bookings/            # Booking CRUD
│   ├── payments/            # Razorpay integration
│   ├── properties/          # Property CRUD
│   └── upload/              # Cloudinary image uploads
└── layout.tsx               # Root layout
```

**Route Group Conventions:**
- `(auth)`: Middleware protects these routes (see `src/middleware.ts`)
- `(public)`: No authentication required
- API routes are **all protected by default** unless explicitly public

### Middleware & Role-Based Access

`src/middleware.ts` handles authentication and role-based routing:

- **Roles:** `TENANT`, `OWNER`, `BROKER`, `ADMIN` (defined in Prisma schema)
- `/admin/*` → `ADMIN` only
- `/owner/*` and `/dashboard/*` → All authenticated users
- `/owner/listings/*` → Requires `isApproved: true` (unless ADMIN)
- Unapproved owners redirected to `/auth/pending`

### Database Schema & Prisma

**9 Core Models:**
1. `User` — Users with roles, KYC status, approval state
2. `Property` — PG listings (owned by User)
3. `Room` — Individual rooms within properties
4. `Booking` — Token bookings with Razorpay payment tracking
5. `Payment` — Payment records
6. `Review` — Tenant reviews for properties
7. `Amenity` — Property amenities
8. `Image`/`Video` — Media for properties
9. `Like` — User favorites

**Important Schema Details:**
- All IDs use `@default(cuid())`
- Database has **composite indexes** for performance (e.g., `[city, isActive, gender]`)
- `directUrl` is used for Prisma migrations (Supabase session pooler)
- `isVerified` on Property indicates admin approval status
- `isApproved` on User indicates owner can create listings

**Prisma Client:**
- Import from `@/lib/prisma` (singleton instance)
- Always use Prisma Client, never raw SQL

### API Route Patterns

All API routes follow these conventions:

1. **Handler Wrapper:** Use `withHandler()` from `@/lib/handler.ts` for error catching
2. **Rate Limiting:** Critical routes use `rateLimit()` from `@/lib/rateLimit.ts`
   - Signup: 10 attempts per IP per 15 min
   - Bookings: 5 per user per hour
   - Property creation: 5 per user per hour
   - Image uploads: 20 per user per hour
3. **Validation:** Use Zod schemas from `@/lib/schemas.ts`
4. **Authentication:** Get session via `getServerSession(authOptions)`
5. **Error Responses:** Return consistent JSON: `{ error: "message" }` with appropriate status codes

**Example API Route Pattern:**
```typescript
import { withHandler } from "@/lib/handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { SomeSchema } from "@/lib/schemas";

export const POST = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const rl = await rateLimit(`endpoint:${session.user.id}`, 5, 60 * 60 * 1000);
  if (!rl.success) return Response.json({ error: "Rate limit exceeded" }, { status: 429 });

  const body = await req.json();
  const validated = SomeSchema.parse(body);

  // ... business logic
});
```

### Validation & Security

**Zod Schemas (`src/lib/schemas.ts`):**
- All user input **must** be validated with Zod before database operations
- Schemas include `.trim()`, `.toLowerCase()`, `.max()` for safety
- Phone numbers: `/^[6-9]\d{9}$/` (Indian format)
- Passwords: min 8, max 128 chars
- URLs: HTTPS only, max 2048 chars

**Security Measures:**
- CSP headers in `next.config.js` (strict, includes Razorpay/Turnstile/Sentry)
- Bcrypt password hashing (12 rounds)
- Rate limiting on all auth and mutation endpoints
- Cloudflare Turnstile CAPTCHA on signup
- Constant-time password comparison (prevents timing attacks)
- Session expires after 24 hours (JWT strategy)

### Authentication Flow

**NextAuth.js Configuration (`src/lib/auth.ts`):**
- **Providers:** Credentials (email/password) + Google OAuth
- **Session Strategy:** JWT (not database sessions)
- **Token Claims:** `id`, `email`, `role`, `isApproved`, `avatar`
- **Login Rate Limiting:** 10 attempts per IP per 15 min
- **Security:** Uses bcrypt with dummy hash for user enumeration prevention

**Session Access:**
```typescript
// Server Component
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
const session = await getServerSession(authOptions);

// Client Component
import { useSession } from "next-auth/react";
const { data: session } = useSession();
```

### Payment Integration (Razorpay)

Token booking flow (₹500):
1. Frontend calls `/api/payments/create-order` (POST)
2. Backend creates Razorpay order, returns `orderId`
3. Frontend shows Razorpay checkout modal
4. On success, frontend calls `/api/payments/verify` (POST) with `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
5. Backend verifies signature, updates booking status to `CONFIRMED`

**Payment Status:**
- `tokenPaid: true` on Booking model indicates successful payment
- Store `razorpayId` for reference

### Image Uploads (Cloudinary)

**Upload Flow:**
1. Frontend calls `/api/upload` (POST) with multipart form data
2. Backend validates file type/size, uploads to Cloudinary
3. Returns `{ url: string }` with optimized image URL
4. Save URL to Property `images` relation (Image model)

**Cloudinary Optimization:**
- Automatic format conversion (AVIF/WebP)
- Image transformations in URL params (e.g., `f_auto,q_auto,w_800`)
- 30-day cache TTL in `next.config.js`

### Email System (Resend)

**4 Email Templates** (in `src/lib/email.ts`):
1. **Booking Confirmation** (to tenant)
2. **Booking Notification** (to owner)
3. **Listing Approved** (to owner)
4. **Listing Rejected** (to owner)

**Sending Emails:**
```typescript
import { sendEmail } from "@/lib/email";
await sendEmail({
  to: user.email,
  subject: "...",
  html: emailTemplate,
});
```

### Error Tracking (Sentry)

**Configuration:**
- Initialized via `instrumentation.ts` (Next.js instrumentation hook)
- Separate configs for server (`sentry.server.config.ts`), client, and edge
- **No withSentryConfig wrapper** — causes build failures (see `next.config.js` comment)
- Source map uploads disabled (can re-enable with `SENTRY_AUTH_TOKEN`)

**Error Handling:**
- All API routes use `withHandler()` which logs to console and returns 500
- Sentry auto-captures uncaught errors
- Never expose stack traces to clients

### State Management

**No global state library** (Redux/Zustand). State management:
- Server state: NextAuth session + server components
- Client state: React hooks (`useState`, `useReducer`)
- Forms: Controlled components with Zod validation

### Styling Conventions

**Tailwind CSS:**
- Custom colors defined in `globals.css` (Terracotta theme: #E07A5F)
- CSS variables for theming: `--primary`, `--secondary`, etc.
- Mobile-first responsive design
- Use Tailwind classes directly, no CSS modules

**Component Structure:**
```
src/components/
├── layout/          # Header, Footer, Sidebar
├── properties/      # Property cards, filters, detail views
├── booking/         # Booking modal, payment UI
├── ui/              # Reusable UI components (Button, Input, Modal)
└── home/            # Homepage-specific components
```

### Environment Variables

**Required Variables:**
- `DATABASE_URL`, `DIRECT_URL` (Supabase PostgreSQL)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (OAuth)
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RESEND_API_KEY`
- `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` (optional)

**Variable Naming:**
- Client-side vars **must** be prefixed with `NEXT_PUBLIC_`
- Server-side secrets (API keys) never have `NEXT_PUBLIC_` prefix

### TypeScript Conventions

- **Strict mode enabled** (`tsconfig.json`)
- Path alias: `@/*` maps to `src/*`
- ESLint rules:
  - `@typescript-eslint/no-unused-vars: "warn"`
  - `@typescript-eslint/no-explicit-any: "off"` (allowed for flexibility)
  - `@typescript-eslint/ban-ts-comment: "off"`
- Type definitions in `src/types/index.ts`
- Always run `npx tsc --noEmit` before committing

### Admin Approval Pipeline

**PG Listing Approval Flow:**
1. Owner creates listing → `isVerified: false` by default
2. Listing hidden from public search
3. Admin views pending PGs at `/admin`
4. Admin approves/rejects via `/api/admin/properties/[id]` (PATCH)
5. Email notification sent to owner
6. Approved listings become public (`isVerified: true`)

**Owner Approval Flow:**
1. Owner signs up with role `OWNER`
2. `isApproved: false` by default
3. Owner cannot create listings until approved
4. Admin approves owner at `/admin/owners`
5. Owner can now create listings

### Key Business Logic

- **Token Amount:** ₹500 (hardcoded in booking flow)
- **Session Expiry:** 24 hours (JWT max age)
- **Password Hashing:** bcrypt with 12 rounds
- **Rate Limits:**
  - Login: 10/15min per IP
  - Booking: 5/hour per user
  - Property creation: 5/hour per user
  - Image upload: 20/hour per user
- **Gender Filtering:** `MALE`, `FEMALE`, `UNISEX` (Prisma enum)
- **Room Types:** `SINGLE`, `DOUBLE`, `TRIPLE`, `SHARED` (allowed room types)

### Deployment (Vercel)

- **Auto-deploy** on push to main branch
- Build command: `npm run build` (runs Prisma generate automatically)
- Environment variables configured in Vercel dashboard
- **Important:** Use Supabase session pooler (`DATABASE_URL`) for production
- Image optimization handled by Vercel + Cloudinary
- Edge Functions not used (all API routes are serverless functions)

## Common Patterns

### Creating a New API Route

1. Create `src/app/api/[route]/route.ts`
2. Export named functions: `GET`, `POST`, `PUT`, `DELETE`
3. Wrap with `withHandler()`
4. Add authentication check if protected
5. Add rate limiting if mutation endpoint
6. Validate input with Zod schema
7. Use Prisma for database operations
8. Return JSON with appropriate status codes

### Adding a New Protected Page

1. Create page in `src/app/(auth)/[route]/page.tsx`
2. Add route to middleware matcher if needed (see `src/middleware.ts`)
3. Check session in server component or use `useSession()` in client component
4. Add role check if admin/owner-only

### Adding a New Database Model

1. Update `prisma/schema.prisma`
2. Run `npx prisma db push` (or create migration)
3. Run `npx prisma generate` to update client
4. Create Zod schema in `src/lib/schemas.ts`
5. Add CRUD API routes as needed
6. Update seed script if applicable

### Working with Images

- Always upload to Cloudinary via `/api/upload`
- Store returned URLs in database (don't store files locally)
- Use Next.js `<Image>` component with Cloudinary URLs
- Cloudinary domains are whitelisted in `next.config.js` → `remotePatterns`

## Important Files

- `src/lib/auth.ts` - NextAuth configuration, login logic
- `src/lib/prisma.ts` - Prisma Client singleton
- `src/lib/schemas.ts` - All Zod validation schemas
- `src/lib/handler.ts` - API error handling wrapper
- `src/lib/rateLimit.ts` - Upstash Redis rate limiter
- `src/middleware.ts` - Route protection and role checks
- `next.config.js` - Security headers, CSP, image optimization
- `prisma/schema.prisma` - Database schema (single source of truth)

## Additional Notes

- **No test framework** - Add Jest/Vitest if tests are needed
- **No internationalization** - English only (Hindi planned in roadmap)
- **No mobile app** - Web-only (React Native planned)
- **DigiLocker KYC** - Integration in progress (see `/api/kyc/digilocker`)
- **WhatsApp Integration** - Uses `wa.me` links with pre-filled messages
- **DPDP Act 2023 Compliance** - Account deletion endpoint at `/api/profile/delete`
