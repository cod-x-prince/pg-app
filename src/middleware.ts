import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest & { nextauth?: any }) {
    const token = (req as any).nextauth?.token;
    const path = req.nextUrl.pathname;

    // Always redirect to login using NEXTAUTH_URL as base — not req.url
    // This prevents callbackUrl from leaking the deployment-specific domain
    const loginUrl = new URL(
      "/auth/login",
      process.env.NEXTAUTH_URL ?? req.nextUrl.origin,
    );
    loginUrl.searchParams.set("callbackUrl", path);

    // ── Role-based route protection ───────────────────────────────────
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(loginUrl);
    }

    if (
      (path.startsWith("/owner") || path.startsWith("/dashboard")) &&
      !["OWNER", "BROKER", "ADMIN", "TENANT"].includes(token?.role ?? "")
    ) {
      return NextResponse.redirect(loginUrl);
    }

    // ── Block unapproved owners from listing ──────────────────────────
    if (
      path.startsWith("/owner/listings") &&
      !token?.isApproved &&
      token?.role !== "ADMIN"
    ) {
      return NextResponse.redirect(
        new URL(
          "/auth/pending",
          process.env.NEXTAUTH_URL ?? req.nextUrl.origin,
        ),
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/owner/:path*", "/admin/:path*"],
};
