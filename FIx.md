# UI Fix Plan

## Goal
Stabilize critical UI behavior, remove misleading interactions, and improve perceived/actual performance without broad refactors.

## Priority 0 (Critical)

### 1. Fix combined filter logic overwrite
- File: src/app/(public)/properties/[city]/page.tsx
- Problem: `where.rooms` is assigned twice; move-in filters are overwritten by rent filters.
- Plan:
1. Build one unified `rooms.some` object.
2. Merge `isAvailable`, move-in conditions, and rent range into a single nested object.
3. Keep behavior identical for single-filter scenarios.
- Validation:
1. Apply only move-in filter -> expected results.
2. Apply only rent filter -> expected results.
3. Apply both together -> both constraints enforced.

### 2. Fix broken price sorting
- File: src/app/(public)/properties/[city]/page.tsx
- Problem: `price_asc`/`price_desc` currently sort by rooms count, not price.
- Plan:
1. Sort by minimum available room rent (or compute a stable price sort strategy).
2. Keep `top_rated` and `newest` behavior unchanged.
3. Add fallback ordering for equal values (e.g., `createdAt desc`).
- Validation:
1. Compare card prices in asc/desc modes.
2. Confirm ordering remains stable after refresh.

### 3. Fix mobile Reserve CTA anchor
- File: src/app/(public)/properties/[city]/[id]/page.tsx
- Problem: CTA links to `#booking` but no `id="booking"` target exists.
- Plan:
1. Add booking anchor on the booking panel container.
2. Verify sticky CTA scroll target aligns above fold and not hidden by fixed bars.
- Validation:
1. Tap Reserve on mobile viewport.
2. Confirm jump lands on booking form consistently.

## Priority 1 (High)

### 4. Fix CustomCursor listener cleanup leak
- File: src/components/ui/CustomCursor.tsx
- Problem: hover listeners are attached to many elements and not removed on unmount.
- Plan:
1. Store element list used for listener binding.
2. Remove both `mouseenter` and `mouseleave` listeners in cleanup.
3. Keep RAF and mousemove cleanup as-is.
- Validation:
1. Navigate across routes repeatedly.
2. Confirm no growing listener count in dev tools.

### 5. Fix dead forgot-password route
- File: src/app/auth/login/page.tsx
- Problem: `href="#"` does not navigate.
- Plan:
1. Replace with valid route `/auth/forgot-password`.
2. Keep existing styles and placement.
- Validation:
1. Click link from login page.
2. Confirm forgot-password page opens.

### 6. Replace full reload breadcrumb links
- File: src/app/(public)/properties/[city]/[id]/page.tsx
- Problem: uses raw `<a>` tags for internal navigation.
- Plan:
1. Replace with Next.js `Link` for Home and City breadcrumb links.
2. Preserve classes and visual styling.
- Validation:
1. Navigate via breadcrumb.
2. Confirm SPA transition (no full page reload).

## Priority 2 (Medium)

### 7. Re-enable optimized property images
- File: src/components/properties/PropertyCard.tsx
- Problem: `unoptimized` on `<Image>` increases payload.
- Plan:
1. Remove `unoptimized` for CDN-hosted images supported by config.
2. Validate image domains in next config.
3. Keep existing `sizes` and visual behavior.
- Validation:
1. Compare network payload and LCP candidate images.
2. Confirm no image loading errors.

### 8. Adjust dynamic/caching strategy
- Files:
1. src/app/(public)/page.tsx
2. src/app/(public)/properties/[city]/page.tsx
3. src/app/(public)/properties/[city]/[id]/page.tsx
- Problem: forced dynamic rendering on key public pages hurts cacheability.
- Plan:
1. Remove `force-dynamic` where not required.
2. Use `revalidate` with sensible intervals for public listing/detail pages.
3. Keep dynamic only where user/session-dependent rendering is needed.
- Validation:
1. Build and verify route render mode output.
2. Measure TTFB improvements under repeated requests.

### 9. Reduce blocking page loader impact
- Files:
1. src/app/layout.tsx
2. src/components/ui/PageLoader.tsx
- Problem: fixed 2600ms loader delays every app load.
- Plan:
1. Gate loader to first load only, or shorten duration significantly.
2. Respect reduced-motion and low-power contexts.
3. Avoid delaying content reveal once app is ready.
- Validation:
1. Manual timing checks on fast network.
2. Ensure no flash/jump regressions.

## Priority 3 (Quality / UX)

### 10. Stabilize navbar hover state logic
- File: src/components/layout/Navbar.tsx
- Problem: inline hover styles depend on `scrolled` and can mismatch forced-white mode.
- Plan:
1. Replace JS hover style mutation with class-based hover states.
2. Derive color from unified nav mode state.
- Validation:
1. Check desktop hover before/after scroll and on force-white pages.
2. Verify text contrast remains compliant.

### 11. Improve HeroSearch interaction race tolerance
- File: src/components/home/HeroSearch.tsx
- Problem: delayed blur closure can cause occasional flicker.
- Plan:
1. Use pointer-down capture or controlled open/close state transitions.
2. Keep keyboard navigation behavior unchanged.
- Validation:
1. Rapid click + keyboard test on dropdown items.
2. Confirm no unintended close while selecting.

### 12. Add accessibility labels on gallery controls
- File: src/components/properties/GalleryClient.tsx
- Problem: close/prev/next controls lack explicit labels.
- Plan:
1. Add `aria-label` to all icon-only control buttons.
2. Keep keyboard support and visual design unchanged.
- Validation:
1. Screen-reader pass for control announcements.
2. Keyboard navigation still works.

### 13. Normalize room type icon mapping
- File: src/app/(public)/properties/[city]/[id]/page.tsx
- Problem: icon logic may not match enum casing.
- Plan:
1. Normalize room type strings (upper-case mapping).
2. Map known enum values explicitly.
3. Add default fallback icon.
- Validation:
1. Check all room types render expected icon.

### 14. Remove duplicate font loading path
- Files:
1. src/app/globals.css
2. src/app/layout.tsx
- Problem: same font loaded via CSS import and head link.
- Plan:
1. Keep one loading strategy only.
2. Prefer one consistent method across app.
- Validation:
1. Confirm no duplicate font requests in network tab.

### 15. Guard Turnstile script injection
- File: src/components/ui/TurnstileWidget.tsx
- Problem: script tag injection can duplicate on remount.
- Plan:
1. Check existing script by src before appending.
2. Reuse global callback safely.
3. Ensure cleanup does not break existing widget instances.
- Validation:
1. Navigate repeatedly to signup.
2. Confirm single script instance and stable widget rendering.

## Execution Order
1. Priority 0 fixes first in one PR.
2. Priority 1 fixes second (interaction correctness).
3. Priority 2 performance pass.
4. Priority 3 polish + accessibility pass.

## Definition of Done
1. `npm run lint` passes.
2. `npx tsc --noEmit` passes.
3. `npm run build` passes.
4. Manual mobile + desktop smoke tests for:
- property filters/sorting
- booking CTA jump
- login recovery flow
- gallery interactions
5. No regressions in route navigation or auth flows.
