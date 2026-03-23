export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { SessionUser } from "@/types"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withHandler } from "@/lib/handler"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Token amount in paise (₹500 = 50000 paise)
const TOKEN_AMOUNT = 50000

export const POST = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bookingId } = await req.json()
  if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 })

  // Verify booking belongs to this user and is pending
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, tenantId: user.id, tokenPaid: false },
    include: {
      property: { select: { name: true, city: true } },
      room: { select: { type: true, rent: true } },
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found or token already paid" }, { status: 404 })
  }

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount:   TOKEN_AMOUNT,
    currency: "INR",
    receipt:  `gharam_token_${bookingId.slice(0, 8)}`,
    notes: {
      bookingId,
      propertyName: booking.property.name,
      roomType:     booking.room.type,
      tenantId:     user.id,
    },
  })

  return NextResponse.json({
    orderId:    order.id,
    amount:     order.amount,
    currency:   order.currency,
    keyId:      process.env.RAZORPAY_KEY_ID,
    bookingId,
    property:   booking.property.name,
    room:       booking.room.type,
  })
})
