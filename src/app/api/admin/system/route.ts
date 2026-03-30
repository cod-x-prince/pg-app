import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withHandler } from "@/lib/handler";
import type { SessionUser } from "@/types";
import {
  getDefaultComingSoonFeatures,
  getMaintenanceMode,
  setMaintenanceMode,
} from "@/lib/systemControl";

export const GET = withHandler(async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!session || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const maintenance = await getMaintenanceMode();

  return NextResponse.json({
    maintenance,
    features: getDefaultComingSoonFeatures(),
    redisConfigured: Boolean(
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
    ),
  });
});

export const PATCH = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!session || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as { maintenance?: unknown };

  if (typeof body.maintenance !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await setMaintenanceMode(body.maintenance);

  return NextResponse.json({ ok: true, maintenance: body.maintenance });
});
