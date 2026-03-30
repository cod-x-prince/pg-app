import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const MAINTENANCE_KEY = "sys:maintenance:enabled";

async function getMaintenanceModeEdge(): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return false;

  try {
    const res = await fetch(`${url}/get/${MAINTENANCE_KEY}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { result?: string | null };
    return data.result === "1";
  } catch {
    return false;
  }
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Google OAuth is currently a placeholder feature.
  // Redirect all direct OAuth entry points to the custom coming-soon page.
  if (
    path.startsWith("/api/auth/signin/google") ||
    path.startsWith("/api/auth/callback/google")
  ) {
    return NextResponse.redirect(new URL("/coming-soon", req.nextUrl.origin));
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
  const role = (token as { role?: string } | null)?.role;
  const isAdmin = role === "ADMIN";
  const isAdminSystemPath =
    path === "/admin/system" || path.startsWith("/admin/system/");

  const loginUrl = new URL(
    "/auth/login",
    process.env.NEXTAUTH_URL ?? req.nextUrl.origin,
  );

  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || path;
  const safeCallbackUrl =
    callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : path;
  loginUrl.searchParams.set("callbackUrl", safeCallbackUrl);

  // Maintenance mode gate:
  // Only admin/system is reachable for admins.
  // Everyone else is redirected to maintenance page (or 503 for API).
  const maintenanceEnabled = await getMaintenanceModeEdge();

  if (maintenanceEnabled) {
    const adminSystemApi = path.startsWith("/api/admin/system");
    const authApi = path.startsWith("/api/auth");

    // Allow APIs needed for admin/system control and session checks.
    if (adminSystemApi || authApi) {
      return NextResponse.next();
    }

    if (isAdmin && isAdminSystemPath) {
      return NextResponse.next();
    }

    if (path.startsWith("/api")) {
      return NextResponse.json(
        {
          error:
            "Service temporarily unavailable due to scheduled maintenance.",
        },
        { status: 503 },
      );
    }

    if (path === "/maintenance") {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/maintenance", req.nextUrl.origin));
  }

  // ── Role-based route protection ─────────────────────────────────────
  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(loginUrl);
  }

  if (
    (path.startsWith("/owner") || path.startsWith("/dashboard")) &&
    !["OWNER", "BROKER", "ADMIN", "TENANT"].includes(role ?? "")
  ) {
    return NextResponse.redirect(loginUrl);
  }

  // ── Block unapproved owners from listing ────────────────────────────
  if (
    path.startsWith("/owner/listings") &&
    !(token as { isApproved?: boolean } | null)?.isApproved &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/auth/pending", process.env.NEXTAUTH_URL ?? req.nextUrl.origin),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|_error|_document|_next).*)",
  ],
};
