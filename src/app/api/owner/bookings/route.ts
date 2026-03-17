export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { SessionUser } from "@/types"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withHandler } from "@/lib/handler"

export const GET = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user || !["OWNER", "BROKER", "ADMIN"].includes(user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page  = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = 30
  const skip  = (page - 1) * limit

  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where: { property: { ownerId: user.id } },
      include: {
        tenant:   { select: { name: true, email: true, phone: true } },
        property: { select: { name: true } },
        room:     true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.booking.count({ where: { property: { ownerId: user.id } } }),
  ])
  return NextResponse.json({ bookings, total, page, pages: Math.ceil(total / limit) })
})
