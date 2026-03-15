export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withHandler } from "@/lib/handler"
import crypto from "crypto"

export const POST = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await req.json()

  // Verify Razorpay signature
  const body      = `${razorpay_order_id}|${razorpay_payment_id}`
  const expected  = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex")

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
  }

  // Mark booking as token paid
  const booking = await prisma.booking.update({
    where: { id: bookingId, tenantId: user.id },
    data: {
      tokenPaid:  true,
      razorpayId: razorpay_payment_id,
      status:     "CONFIRMED",
      type:       "DIRECT",
    },
    include: {
      property: { select: { name: true, city: true, whatsapp: true } },
      room:     { select: { type: true, rent: true } },
      tenant:   { select: { name: true, email: true, phone: true } },
    },
  })

  // Send confirmation emails (non-blocking)
  try {
    await fetch(`${process.env.NEXTAUTH_URL}/api/email/booking-confirmed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id }),
    })
  } catch {
    // Email failure should not block payment confirmation
  }

  return NextResponse.json({
    success: true,
    bookingId: booking.id,
    message: "Token payment confirmed! Owner will contact you shortly.",
  })
})
