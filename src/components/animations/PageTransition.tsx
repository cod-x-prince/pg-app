/**
 * PageTransition Component
 * Handles page transitions using Framer Motion AnimatePresence
 * Route-specific animations based on pathname
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  homepageVariants,
  listingsVariants,
  propertyDetailVariants,
  authVariants,
  dashboardVariants,
  adminVariants,
  shouldAnimate,
} from "@/lib/animations/config";
import { getRouteType } from "@/lib/animations/utils";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  
  // If animations are disabled, render without transitions
  if (!shouldAnimate()) {
    return <>{children}</>;
  }

  // Determine which animation variant to use based on route
  const getVariants = () => {
    const routeType = getRouteType(pathname);

    switch (routeType) {
      case "homepage":
        return homepageVariants;
      case "listings":
        // Check if it's a detail page (has ID in path)
        return pathname.split("/").length > 3
          ? propertyDetailVariants
          : listingsVariants;
      case "auth":
        return authVariants;
      case "dashboard":
        return dashboardVariants;
      case "admin":
        return adminVariants;
      default:
        return authVariants; // Simple fade for unknown routes
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={getVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        className="gpu-accelerated"
        style={{
          width: "100%",
          minHeight: "100vh",
        }}
        // Add onAnimationComplete callback for debugging
        onAnimationStart={() => {
          // Prevent scroll during transition
          document.body.style.overflow = "hidden";
        }}
        onAnimationComplete={() => {
          // Re-enable scroll after transition
          document.body.style.overflow = "";
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
