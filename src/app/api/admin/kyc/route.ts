import { withHandler } from "@/lib/handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/types";

export const dynamic = "force-dynamic";

export const GET = withHandler(async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usersWithKYC = await prisma.user.findMany({
    where: { kycDocuments: { some: {} } },
    select: {
      id: true,
      name: true,
      email: true,
      kycDocuments: { orderBy: { createdAt: "desc" } },
    },
  });

  const submissions = usersWithKYC.map((user) => ({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    documents: user.kycDocuments.map((doc) => ({
      id: doc.id,
      type: doc.type,
      fileUrl: doc.fileUrl,
      status: doc.status,
      uploadedAt: doc.uploadedAt.toISOString(),
    })),
  }));

  return NextResponse.json(submissions);
});
