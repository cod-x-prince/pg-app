import { withHandler } from "@/lib/handler";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export const GET = withHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rl = await rateLimit(`health:${ip}`, 30, 60 * 1000);
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const checks: Record<string, any> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "healthy" };
  } catch (error: any) {
    checks.database = { status: "unhealthy", error: error.message };
  }

  try {
    await rateLimit("health-check", 1, 1000);
    checks.redis = { status: "healthy" };
  } catch (error: any) {
    checks.redis = { status: "unhealthy", error: error.message };
  }

  const allHealthy = Object.values(checks).every(
    (c: any) => c.status === "healthy",
  );

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allHealthy ? 200 : 503 },
  );
});
