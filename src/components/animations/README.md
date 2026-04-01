# Animation System Documentation

## Overview

Complete animation system for Gharam (PGLife) using **Framer Motion** and **GSAP**. Features smooth page transitions, scroll-triggered reveals, micro-interactions, and full accessibility support.

## ✨ Features Implemented

### Core System
- ✅ **11 Reusable Components** - Ready to use animation components
- ✅ **Fast Animations** - 200-300ms timing (no lag)
- ✅ **Route-Specific Transitions** - Custom animations per page type
- ✅ **Scroll Animations** - Elements reveal on scroll
- ✅ **Accessibility** - Full `prefers-reduced-motion` support
- ✅ **GPU Accelerated** - Uses `transform` and `opacity` only
- ✅ **TypeScript** - Fully typed with strict mode

### Components Available

1. **PageTransition** - Automatic page transitions based on route
2. **ScrollReveal** - Fade-up, fade-in, scale-up on scroll
3. **StaggeredList** - List items animate with delay
4. **AnimatedCounter** - Numbers count up with easing
5. **ParallaxSection** - GSAP parallax scrolling
6. **FormFeedback** - Shake on error, checkmark on success
7. **AnimatedButton** - Loading states & hover effects
8. **AnimatedModal** - Scale + fade entrance/exit
9. **AnimatedBadge** - Bounce animation for notifications
10. **AnimatedDropdown** - Smooth menu animations
11. **AnimatedTooltip** - Fade-in tooltips

## 🚀 Quick Start

### Import from Index
```tsx
import {
  ScrollReveal,
  StaggeredList,
  AnimatedCounter,
  AnimatedButton,
  AnimatedModal,
  FormFeedback,
} from "@/components/animations";
```

### Basic Usage

#### Scroll Reveal
```tsx
<ScrollReveal variant="fade-up" delay={0.1}>
  <YourComponent />
</ScrollReveal>
```

#### Animated Counter
```tsx
<AnimatedCounter 
  target={1000} 
  format={true}
  suffix="+" 
  duration={2000} 
/>
// Result: Counts from 0 to "1,000+" over 2 seconds
```

#### Staggered List
```tsx
<StaggeredList staggerDelay={0.08}>
  {items.map(item => (
    <ItemComponent key={item.id} {...item} />
  ))}
</StaggeredList>
```

#### Animated Button
```tsx
<AnimatedButton 
  loading={isLoading}
  variant="primary"
  onClick={handleSubmit}
>
  Submit
</AnimatedButton>
```

#### Form Feedback
```tsx
<FormFeedback 
  error={errors.email} 
  success={successMessage} 
/>
```

#### Animated Modal
```tsx
<AnimatedModal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Booking"
>
  <ModalContent />
</AnimatedModal>
```

#### Notification Badge
```tsx
<div className="relative">
  <BellIcon />
  <AnimatedBadge count={unreadCount} max={99} />
</div>
```

#### Animated Dropdown
```tsx
<AnimatedDropdown 
  isOpen={showMenu}
  onClose={() => setShowMenu(false)}
  align="right"
>
  <MenuItem />
  <MenuItem />
</AnimatedDropdown>
```

#### Tooltip
```tsx
<AnimatedTooltip content="Click to save" position="top">
  <button>Save</button>
</AnimatedTooltip>
```

## ⚙️ Configuration

### Animation Timing
```ts
import { ANIMATION_TIMING } from "@/lib/animations/config";

ANIMATION_TIMING.fast      // 200ms - Instant feedback
ANIMATION_TIMING.normal    // 300ms - Page transitions
ANIMATION_TIMING.moderate  // 400ms - Scroll reveals
```

### Easing Curves
```ts
import { EASING } from "@/lib/animations/config";

EASING.default      // [0.4, 0.0, 0.2, 1]
EASING.bounce       // [0.68, -0.55, 0.265, 1.55]
EASING.spring       // [0.175, 0.885, 0.32, 1.275]
```

### Custom Variants
```ts
import { 
  fadeUpVariants,
  fadeInVariants,
  scaleUpVariants,
  modalVariants,
} from "@/lib/animations/config";
```

## 🎯 Hooks

### useScrollReveal
```tsx
import { useScrollReveal } from "@/lib/animations/hooks";

const { ref, isInView } = useScrollReveal({
  threshold: 0.2,
  triggerOnce: true,
});

<div ref={ref}>
  {isInView && <Content />}
</div>
```

### useAnimatedCounter
```tsx
import { useAnimatedCounter } from "@/lib/animations/hooks";

const { ref, count } = useAnimatedCounter(500, {
  duration: 2000,
  delay: 100,
});

<span ref={ref}>{count}</span>
```

### useHoverScale
```tsx
import { useHoverScale } from "@/lib/animations/hooks";
import { motion } from "framer-motion";

const hoverProps = useHoverScale(1.02);

<motion.div {...hoverProps}>
  Hover me!
</motion.div>
```

### useShakeOnError
```tsx
import { useShakeOnError } from "@/lib/animations/hooks";
import { motion } from "framer-motion";

const controls = useShakeOnError(hasError);

<motion.div animate={controls}>
  <Input error={hasError} />
</motion.div>
```

## 🎨 CSS Utility Classes

### Hardware Acceleration
```html
<div class="gpu-accelerated">
  <!-- Optimized for smooth animations -->
</div>
```

### Animation Classes
```html
<div class="animate-fade-in">Fades in</div>
<div class="animate-fade-in-up">Fades up</div>
<div class="animate-scale-in">Scales in</div>
<div class="animate-shake">Shakes (error)</div>
<div class="animate-pulse">Pulses</div>
<div class="animate-bounce">Bounces</div>
<div class="animate-spin">Spins (loader)</div>
<div class="animate-heart-beat">Heart beat</div>
```

### Delay Utilities
```html
<div class="animate-fade-in delay-100">Delayed by 100ms</div>
<div class="animate-fade-in delay-200">Delayed by 200ms</div>
<div class="animate-fade-in delay-300">Delayed by 300ms</div>
```

## 📦 Page Transitions

Page transitions work automatically based on route type:

| Route | Animation | Duration |
|-------|-----------|----------|
| Homepage (`/`) | Fade + scale with stagger | 400ms |
| Listings (`/properties/*`) | Slide from right | 300ms |
| Detail Pages | Slide + scale | 300ms |
| Auth (`/auth/*`) | Simple fade | 300ms |
| Dashboard (`/dashboard/*`) | Slide from left | 300ms |
| Admin (`/admin/*`) | Simple fade | 300ms |

**No setup required** - Transitions are handled by the layout system.

## ♿ Accessibility

All animations respect user preferences:

```ts
import { 
  shouldAnimate, 
  prefersReducedMotion 
} from "@/lib/animations/config";

// Check before animating
if (shouldAnimate()) {
  // Safe to animate
}

// Check reduced motion preference
if (prefersReducedMotion()) {
  // User prefers reduced motion
}
```

**Automatic Fallbacks:**
- If `prefers-reduced-motion: reduce` → No animations
- If low-end device detected → No animations
- Components render normally without motion

## 🔧 Advanced Usage

### Create Custom Variants
```ts
import { createFadeVariant, createScaleVariant } from "@/lib/animations/utils";

const customFade = createFadeVariant("up", 50);
const customScale = createScaleVariant(0.8, 1);
```

### Custom Stagger
```ts
import { createStagger } from "@/lib/animations/utils";

const staggerVariants = createStagger(0.1, 0.2);
```

### Route Type Detection
```ts
import { getRouteType } from "@/lib/animations/utils";

const routeType = getRouteType(pathname);
// Returns: "homepage" | "listings" | "auth" | "dashboard" | "admin" | "default"
```

### Math Utilities
```ts
import { lerp, clamp, mapRange } from "@/lib/animations/utils";

const interpolated = lerp(0, 100, 0.5);      // 50
const clamped = clamp(150, 0, 100);           // 100
const mapped = mapRange(50, 0, 100, 0, 1);    // 0.5
```

## ⚡ Performance Tips

1. **Use GPU Acceleration**
   ```tsx
   <motion.div className="gpu-accelerated">
     {/* Transforms are hardware-accelerated */}
   </motion.div>
   ```

2. **Lazy Load GSAP**
   - GSAP ScrollTrigger is lazy-loaded automatically
   - Only loaded when ParallaxSection is used

3. **Cleanup Effects**
   - All hooks include proper cleanup
   - No memory leaks from animations

4. **Conditional Rendering**
   ```tsx
   {shouldAnimate() ? (
     <motion.div>Animated</motion.div>
   ) : (
     <div>Static</div>
   )}
   ```

## 📊 Bundle Impact

| Library | Size (gzipped) |
|---------|----------------|
| framer-motion | ~35 KB |
| gsap (lazy) | ~30 KB |
| **Total** | **~65 KB** |

**Homepage Impact:**
- Before: ~90 KB
- After: ~156 KB (+66 KB)
- **Within acceptable range** ✅

## 🐛 Troubleshooting

### Animations Not Working?

1. Check if `prefers-reduced-motion` is enabled
2. Verify component is client-side (`"use client"`)
3. Check browser console for errors
4. Ensure Framer Motion is installed

### Performance Issues?

1. Reduce `staggerDelay` values
2. Use `threshold` in ScrollReveal to trigger earlier
3. Disable animations on low-end devices:
   ```ts
   if (getPerformanceLevel() === "low") {
     // Skip animations
   }
   ```

### Layout Shifts?

1. Add explicit dimensions to animated elements
2. Use `layout` prop on motion components for shared layouts
3. Reserve space for animated content

## 📚 Examples

See implemented examples:
- **Homepage**: `/src/app/(public)/page.tsx`
- **PropertyCard**: `/src/components/properties/PropertyCard.tsx`
- **NotificationBell**: `/src/components/layout/NotificationBell.tsx`

## 🔗 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [GSAP Docs](https://greensock.com/docs/)
- [Web Animations Performance](https://web.dev/animations/)

---

**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** ✅ Production Ready
