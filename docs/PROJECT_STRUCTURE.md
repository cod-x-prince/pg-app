# Project Structure

## Root Directory

```
pglife/
├── .github/                    # GitHub configuration
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/                       # Documentation
│   ├── archive/                # Historical reports and fixes
│   ├── deployment/             # Deployment guides and checklists
│   ├── development/            # Development guides
│   ├── DEEP_SCAN_GUIDE.md      # Comprehensive deep scan documentation
│   └── DEEP_SCAN_QUICK_REF.md  # Quick reference for scans
│
├── prisma/                     # Database
│   ├── schema.prisma           # Database schema (single source of truth)
│   └── seed.ts                 # Database seeding script
│
├── public/                     # Static assets
│   ├── images/
│   └── favicon.ico
│
├── scripts/                    # Build and analysis scripts
│   ├── deep-code-reviewer.js          # File-by-file code analysis
│   ├── pre-launch-deep-scan.js        # Pre-launch comprehensive scan
│   ├── true-deep-scan.js              # Multi-tool deep scan
│   ├── verify-deep-scan-setup.js      # Setup verification
│   └── *.sh                           # Shell scripts
│
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Protected routes (requires auth)
│   │   │   ├── admin/          # Admin-only pages
│   │   │   ├── dashboard/      # Owner dashboard
│   │   │   ├── owner/          # Owner-specific pages
│   │   │   └── profile/        # User profile pages
│   │   │
│   │   ├── (public)/           # Public routes (no auth required)
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── listings/       # Property search and details
│   │   │   └── booking/        # Booking flow
│   │   │
│   │   ├── api/                # API routes
│   │   │   ├── admin/          # Admin operations
│   │   │   ├── auth/           # Authentication (NextAuth)
│   │   │   ├── bookings/       # Booking CRUD
│   │   │   ├── payments/       # Razorpay integration
│   │   │   ├── properties/     # Property CRUD
│   │   │   └── upload/         # Cloudinary image uploads
│   │   │
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── layout/             # Header, Footer, Sidebar
│   │   ├── properties/         # Property cards, filters
│   │   ├── booking/            # Booking UI
│   │   ├── ui/                 # Reusable UI components
│   │   └── home/               # Homepage components
│   │
│   ├── lib/                    # Utilities and configurations
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── prisma.ts           # Prisma Client singleton
│   │   ├── schemas.ts          # Zod validation schemas
│   │   ├── handler.ts          # API error handler wrapper
│   │   ├── rateLimit.ts        # Upstash Redis rate limiter
│   │   ├── email.ts            # Resend email templates
│   │   └── utils.ts            # Utility functions
│   │
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts
│   │
│   └── middleware.ts           # Next.js middleware (auth & routing)
│
├── deep-scan-reports/          # Deep scan results (gitignored)
│
├── .env                        # Environment variables (not in git)
├── .env.example                # Environment template
├── .gitignore
├── bugDebugger.ps1             # PowerShell bug debugger
├── DEEPSCAN.md                 # Deep scan complete guide
├── eslint.config.mjs           # Standard ESLint config
├── eslint.deep.config.mjs      # Deep ESLint config (pre-launch)
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── README.md                   # Project overview
├── README_ELITE.md             # Extended documentation
├── sentry.*.config.ts          # Sentry configurations
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Key Directories Explained

### `/src/app/`
Next.js 14 App Router structure:
- `(auth)/` - Protected routes requiring authentication
- `(public)/` - Public routes accessible without auth
- `api/` - REST API endpoints

### `/src/components/`
React components organized by feature:
- `layout/` - Page layout components
- `properties/` - Property-related components
- `booking/` - Booking flow components
- `ui/` - Reusable UI primitives

### `/src/lib/`
Core utilities and configurations:
- Authentication (NextAuth)
- Database (Prisma)
- Validation (Zod)
- Email (Resend)
- Rate limiting (Upstash)

### `/docs/`
Documentation organized by purpose:
- `archive/` - Historical reports (bug fixes, implementations)
- `deployment/` - Launch checklists and deployment guides
- `development/` - Development tools and audit reports

### `/scripts/`
Automation and analysis scripts:
- Deep code scanning
- Pre-launch verification
- Database migrations
- Deployment checks

### `/prisma/`
Database layer:
- `schema.prisma` - Single source of truth for database schema
- `seed.ts` - Initial data seeding

## Important Files

### Configuration Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js config (CSP, images, Sentry) |
| `tsconfig.json` | TypeScript strict mode config |
| `eslint.config.mjs` | Standard ESLint (daily use) |
| `eslint.deep.config.mjs` | Deep ESLint (pre-launch) |
| `tailwind.config.js` | Tailwind CSS customization |
| `prisma/schema.prisma` | Database schema |

### Core Application Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Route protection & role checks |
| `src/lib/auth.ts` | NextAuth configuration |
| `src/lib/prisma.ts` | Database client singleton |
| `src/lib/schemas.ts` | All Zod validation schemas |
| `src/lib/handler.ts` | API error handling |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `DEEPSCAN.md` | Pre-launch deep scan guide |
| `docs/DEEP_SCAN_GUIDE.md` | Comprehensive scan docs |
| `docs/DEEP_SCAN_QUICK_REF.md` | Quick reference |

## Ignored Directories (Not in Git)

```
node_modules/           # npm dependencies
.next/                  # Next.js build output
deep-scan-reports/      # Scan results
.env                    # Environment variables (secrets)
tsconfig.tsbuildinfo    # TypeScript build cache
```

## Route Organization

### Public Routes (`(public)/`)
- `/` - Homepage
- `/listings` - Property search
- `/listings/[id]` - Property details
- `/booking/[id]` - Token booking

### Protected Routes (`(auth)/`)
- `/dashboard` - Owner dashboard
- `/owner/listings/create` - Create PG listing
- `/owner/listings/[id]/edit` - Edit listing
- `/profile` - User profile
- `/profile/kyc` - KYC verification
- `/admin` - Admin panel (ADMIN role only)

### API Routes (`/api/`)
- `/api/auth/*` - NextAuth endpoints
- `/api/properties/*` - Property CRUD
- `/api/bookings/*` - Booking operations
- `/api/payments/*` - Razorpay integration
- `/api/upload` - Image uploads
- `/api/admin/*` - Admin operations

## Development Workflow

### File Naming Conventions
- **Components:** PascalCase (e.g., `PropertyCard.tsx`)
- **Utilities:** camelCase (e.g., `utils.ts`)
- **API Routes:** kebab-case folders (e.g., `get-properties`)
- **Types:** PascalCase interfaces/types in `types/index.ts`

### Import Aliases
All imports use `@/` alias mapping to `src/`:
```typescript
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { PropertySchema } from "@/lib/schemas";
```

## Scripts Organization

### npm Scripts by Category

**Development:**
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm start` - Start production server

**Quality Checks:**
- `npm run lint` - Standard linting
- `npm run lint:deep` - Deep linting (pre-launch)
- `npm run type-check` - Basic TypeScript check
- `npm run type-check:strict` - Strict TypeScript check

**Deep Scanning:**
- `npm run scan:pre-launch` - Full pre-launch scan (2-4 hrs)
- `npm run scan:pre-launch:quick` - Quick scan (30-60 min)
- `npm run scan:deep` - True deep scan
- `npm run scan:code` - Custom code review
- `npm run scan:verify` - Verify setup

**Analysis:**
- `npm run analyze:deps` - Circular dependencies
- `npm run analyze:duplication` - Code duplication

**Database:**
- `npm run db:push` - Push schema to DB
- `npm run db:studio` - Open Prisma Studio
- `npm run db:generate` - Generate Prisma Client
- `npm run db:seed` - Seed database

## Clean Codebase Principles

1. **No temporary files in root** - All working docs in `docs/`
2. **No duplicate configs** - Single source of truth
3. **Organized by feature** - Related code stays together
4. **Clear naming** - File names describe purpose
5. **Documentation up-to-date** - Reflects actual structure
6. **Git ignored properly** - No secrets, build artifacts
7. **Scripts in `/scripts/`** - Automation centralized
8. **Types in `/src/types/`** - Shared types organized

## Production Readiness

### Before Deploy Checklist
- [ ] All docs in proper directories
- [ ] No temporary/test files in root
- [ ] `.env` not committed
- [ ] `deep-scan-reports/` gitignored
- [ ] All scripts executable
- [ ] README up-to-date
- [ ] DEEPSCAN.md complete
- [ ] Run `npm run scan:pre-launch`

---

**Last Updated:** 2026-03-29  
**Version:** 1.0.0  
**Status:** Production Ready ✅
