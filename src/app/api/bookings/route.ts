export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { SessionUser } from "@/types"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rateLimit"
import { CreateBookingSchema, parseBody } from "@/lib/schemas"
import { withHandler } from "@/lib/handler"

export const POST = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Please login to book" }, { status: 401 })

  const rl = await rateLimit(`booking:${user.id}`, 10, 24 * 60 * 60 * 1000)
  if (!rl.success)
    return NextResponse.json({ error: "Too many booking requests today." }, { status: 429 })

  const parsed = parseBody(CreateBookingSchema, await req.json())
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 })

  const { propertyId, roomId, moveInDate, type } = parsed.data

  const room = await prisma.room.findFirst({
    where: { id: roomId, propertyId, isAvailable: true },
  })
  if (!room) return NextResponse.json({ error: "Room not available" }, { status: 400 })

  const duplicate = await prisma.booking.findFirst({
    where: { tenantId: user.id, roomId, status: { in: ["PENDING", "CONFIRMED"] } },
  })
  if (duplicate)
    return NextResponse.json({ error: "You already have an active booking for this room" }, { status: 409 })

  const booking = await prisma.booking.create({
    data: { 
      tenantId: user.id, 
      propertyId, 
      roomId, 
      moveInDate: new Date(moveInDate), 
      type,
      tokenAmount: 500,           // Lock in token amount at booking time
      monthlyRent: room.rent      // Lock in rent at booking time (price history)
    },
    select: { id: true, type: true, status: true, moveInDate: true, tokenAmount: true, monthlyRent: true },
  })
  return NextResponse.json(booking, { status: 201 })
})

export const GET = withHandler(async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where: { tenantId: user.id },
    include: {
      property: {
        select: { id: true, name: true, city: true, images: { where: { isPrimary: true }, take: 1 } },
      },
      room: { select: { type: true, rent: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json(bookings)
})
