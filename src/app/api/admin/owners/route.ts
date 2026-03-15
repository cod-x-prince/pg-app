export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withHandler } from "@/lib/handler"

export const GET = withHandler(async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (user?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const pending = await prisma.user.findMany({
    where:   { role: { in: ["OWNER", "BROKER"] }, isApproved: false },
    orderBy: { createdAt: "desc" },
    take:    100,
    select: {
      id: true, name: true, email: true,
      phone: true, role: true, createdAt: true,
    },
  })
  return NextResponse.json(pending)
})
