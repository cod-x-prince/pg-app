import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest & { nextauth?: any }) {
    const token = (req as any).nextauth?.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (
      path.startsWith("/owner/listings") &&
      !token?.isApproved &&
      token?.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/auth/pending", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/owner/:path*", "/admin/:path*"],
};
