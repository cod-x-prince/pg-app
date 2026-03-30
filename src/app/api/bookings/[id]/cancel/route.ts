export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withHandler } from "@/lib/handler"
import type { SessionUser } from "@/types"

export const POST = withHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const bookingId = params.id

  // Fetch booking with property and room details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: true,
      room: true,
      tenant: true,
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Authorization: Only tenant who made the booking can cancel
  if (booking.tenantId !== user.id) {
    return NextResponse.json({ error: "Not authorized to cancel this booking" }, { status: 403 })
  }

  // Check if booking is already cancelled or completed
  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 })
  }

  if (booking.status === "COMPLETED") {
    return NextResponse.json({ error: "Cannot cancel completed booking" }, { status: 400 })
  }

  // Calculate refund amount based on cancellation policy
  const moveInDate = new Date(booking.moveInDate)
  const now = new Date()
  const daysUntilMoveIn = Math.ceil((moveInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  let refundAmount = 0
  let refundPercentage = 0

  if (daysUntilMoveIn > 7) {
    // More than 7 days: Full refund (100%)
    refundAmount = 500
    refundPercentage = 100
  } else if (daysUntilMoveIn >= 2) {
    // 2-7 days: Partial refund (50%)
    refundAmount = 250
    refundPercentage = 50
  }
  // Less than 2 days: No refund (0%)

  // Update booking status to CANCELLED
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
    },
  })

  // Initiate Razorpay refund if token was paid and refund amount > 0
  if (booking.tokenPaid && refundAmount > 0 && booking.razorpayId) {
    try {
      const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
      const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        console.error("[Cancel] Razorpay credentials not configured")
      } else {
        // Create Basic Auth header
        const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`

        // Initiate refund via Razorpay API
        const refundResponse = await fetch(`https://api.razorpay.com/v1/payments/${booking.razorpayId}/refund`, {
          method: "POST",
          headers: {
            "Authorization": authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: refundAmount * 100, // Convert to paise
            speed: "normal",
            notes: {
              booking_id: bookingId,
              reason: "Booking cancelled by tenant",
            },
          }),
        })

        if (!refundResponse.ok) {
          const refundData = await refundResponse.json()
          console.error("[Cancel] Razorpay refund failed:", refundData)
        }
      }
    } catch (error) {
      console.error("[Cancel] Razorpay refund error:", error)
    }
  }

  // Send cancellation emails
  try {
    const { sendEmail } = await import("@/lib/email")

    // Email to tenant
    await sendEmail({
      to: booking.tenant.email,
      subject: `Booking Cancelled - ${booking.property.name}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B3B6F;">Your Booking Has Been Cancelled</h2>
          <p>Hi ${booking.tenant.name},</p>
          <p>Your booking for <strong>${booking.property.name}</strong> in ${booking.property.city} has been cancelled successfully.</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Refund Details</h3>
            <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
            <p><strong>Refund Percentage:</strong> ${refundPercentage}%</p>
            ${refundAmount > 0 ? `<p>Your refund will be processed within 5-7 business days to your original payment method.</p>` : `<p>No refund applicable as per our cancellation policy (less than 2 days before move-in).</p>`}
          </div>

          <p>If you have any questions, please contact our support team at <a href="mailto:support@gharam.in">support@gharam.in</a>.</p>
          
          <p>Best regards,<br><strong>Gharam Team</strong></p>
        </div>
      `,
    })

    // Email to property owner
    const owner = await prisma.user.findUnique({
      where: { id: booking.property.ownerId },
      select: { name: true, email: true },
    })

    if (owner) {
      await sendEmail({
        to: owner.email,
        subject: `Booking Cancelled - ${booking.property.name}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1B3B6F;">A Booking Has Been Cancelled</h2>
            <p>Hi ${owner.name},</p>
            <p>A booking for your property <strong>${booking.property.name}</strong> has been cancelled by the tenant.</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details</h3>
              <p><strong>Tenant:</strong> ${booking.tenant.name}</p>
              <p><strong>Room Type:</strong> ${booking.room.type}</p>
              <p><strong>Move-in Date:</strong> ${moveInDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p><strong>Cancelled On:</strong> ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>

            <p>The room is now available for new bookings.</p>
            
            <p>Best regards,<br><strong>Gharam Team</strong></p>
          </div>
        `,
      })
    }
  } catch (emailError) {
    console.error("[Cancel] Failed to send cancellation emails:", emailError)
  }

  return NextResponse.json({
    success: true,
    message: "Booking cancelled successfully",
    refundAmount,
    refundPercentage,
    daysUntilMoveIn,
  })
})
