import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateReviewSchema, parseBody } from "@/lib/schemas"
import { withHandler } from "@/lib/handler"

export const POST = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = parseBody(CreateReviewSchema, await req.json())
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 })

  const { propertyId, rating, comment } = parsed.data

  const hasBooking = await prisma.booking.findFirst({
    where: { tenantId: user.id, propertyId, status: "CONFIRMED" },
  })
  if (!hasBooking)
    return NextResponse.json({ error: "You can only review a PG after a confirmed booking" }, { status: 403 })

  const existing = await prisma.review.findFirst({ where: { tenantId: user.id, propertyId } })
  if (existing)
    return NextResponse.json({ error: "You have already reviewed this PG" }, { status: 409 })

  const review = await prisma.review.create({
    data: { tenantId: user.id, propertyId, rating, comment: comment ?? null },
    select: { id: true, rating: true, comment: true, createdAt: true },
  })
  return NextResponse.json(review, { status: 201 })
})
