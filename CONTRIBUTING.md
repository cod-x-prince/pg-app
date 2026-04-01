# Contributing to PGLife

Thank you for your interest in contributing to PGLife! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

---

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js >= 20.x
- npm or yarn
- PostgreSQL database (Supabase recommended)
- Git

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/pg-app.git
cd pg-app

# Add upstream remote
git remote add upstream https://github.com/cod-x-prince/pg-app.git
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# See README.md for detailed environment variable descriptions
```

### Set Up Database

```bash
npx prisma db push
npx prisma generate
npm run db:seed
```

### Start Development Server

```bash
npm run dev
# Visit http://localhost:3000
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**

- `feature/` - New features (e.g., `feature/add-wishlist`)
- `fix/` - Bug fixes (e.g., `fix/booking-validation`)
- `docs/` - Documentation updates (e.g., `docs/api-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-logic`)
- `test/` - Adding tests (e.g., `test/booking-flow`)

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Lint your code
npm run lint

# Type check
npm run type-check

# Run unit tests
npm test

# Run E2E tests (if applicable)
npm run test:e2e
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add wishlist functionality"
```

See [Commit Message Guidelines](#commit-message-guidelines) below.

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub from your fork to the main repository.

---

## Coding Standards

### TypeScript

- **Strict mode enabled** - Follow TypeScript strict rules
- **Type everything** - Avoid `any` unless absolutely necessary
- **Use type inference** - Let TypeScript infer types when obvious
- **Use interfaces for objects** - Define clear interfaces for data structures

### Code Style

- **2 spaces indentation** (configured in ESLint)
- **Semicolons required**
- **Single quotes for strings**
- **Trailing commas in multi-line** objects/arrays
- **Arrow functions preferred** over function expressions

### File Organization

```typescript
// 1. Imports (grouped: React, Next.js, third-party, local)
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { validateInput } from "@/lib/utils";

// 2. Type definitions
interface ComponentProps {
  title: string;
  onSave: () => void;
}

// 3. Component
export default function Component({ title, onSave }: ComponentProps) {
  // Component logic
}
```

### Naming Conventions

- **Components**: PascalCase (e.g., `PropertyCard.tsx`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_UPLOAD_SIZE`)
- **Interfaces**: PascalCase with "I" prefix optional (e.g., `User` or `IUser`)
- **Zod Schemas**: PascalCase with "Schema" suffix (e.g., `SignupSchema`)

### React Best Practices

- **Use functional components** with hooks
- **Extract reusable logic** into custom hooks
- **Avoid prop drilling** - Use Context API when needed
- **Server Components first** - Use Client Components only when necessary
- **Memoize expensive computations** with useMemo
- **Avoid inline functions** in JSX props (use useCallback)

### API Routes

All API routes must follow this pattern:

```typescript
import { withHandler } from "@/lib/handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { YourSchema } from "@/lib/schemas";

export const POST = withHandler(async (req: Request) => {
  // 1. Authentication
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  // 2. Rate limiting
  const rl = await rateLimit(`endpoint:${session.user.id}`, 5, 3600000);
  if (!rl.success) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // 3. Validation
  const body = await req.json();
  const validated = YourSchema.parse(body);

  // 4. Business logic
  // ...

  // 5. Return response
  return Response.json({ success: true, data: result });
});
```

### Database

- **Always use Prisma Client** - Never raw SQL queries
- **Validate input** with Zod before database operations
- **Use transactions** for operations that modify multiple tables
- **Add indexes** for frequently queried fields
- **Include timestamps** (createdAt, updatedAt) on all models

---

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`npm test` and `npm run test:e2e`)
2. ✅ Linting passes (`npm run lint`)
3. ✅ Type checking passes (`npm run type-check`)
4. ✅ Code is formatted consistently
5. ✅ Documentation is updated
6. ✅ Commit messages follow guidelines

### PR Title Format

Use conventional commits format:

```
<type>: <description>

Examples:
feat: add wishlist functionality
fix: resolve booking validation bug
docs: update API documentation
refactor: simplify authentication logic
test: add booking flow E2E tests
```

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?

Describe the tests you ran to verify your changes

## Checklist

- [ ] My code follows the coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### Review Process

1. **Automated checks** run (CI pipeline)
2. **Code review** by maintainers
3. **Feedback addressed** by contributor
4. **Approved and merged** by maintainer

---

## Testing Guidelines

### Unit Tests

- Use Jest + React Testing Library
- Test files: `__tests__/` directory or `*.test.ts` files
- Mock external dependencies
- Aim for 70%+ code coverage

**Example:**

```typescript
import { render, screen } from "@testing-library/react";
import PropertyCard from "@/components/properties/PropertyCard";

describe("PropertyCard", () => {
  it("displays property title", () => {
    render(<PropertyCard title="Cozy PG" price={5000} />);
    expect(screen.getByText("Cozy PG")).toBeInTheDocument();
  });
});
```

### E2E Tests

- Use Playwright
- Test files: `tests/e2e/` directory
- Test critical user flows
- Run before major releases

**Example:**

```typescript
import { test, expect } from "@playwright/test";

test("user can sign up successfully", async ({ page }) => {
  await page.goto("/auth/signup");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/dashboard");
});
```

---

## Commit Message Guidelines

We follow **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependency updates, etc.)
- **perf**: Performance improvements
- **ci**: CI/CD changes

### Examples

```bash
# Simple commit
git commit -m "feat: add wishlist feature"

# With scope
git commit -m "fix(auth): resolve login redirect issue"

# With body and footer
git commit -m "feat(payments): integrate Razorpay webhooks

Webhooks handle payment success/failure events automatically.
This reduces manual payment verification overhead.

Closes #123"
```

### Rules

- Use present tense ("add" not "added")
- Use imperative mood ("move" not "moves")
- First line max 72 characters
- Reference issues in footer (`Closes #123`, `Fixes #456`)

---

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/cod-x-prince/pg-app/discussions)
- **Bug reports?** Open an [Issue](https://github.com/cod-x-prince/pg-app/issues)
- **Need clarification?** Comment on relevant PR or issue

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to PGLife! 🚀**
