export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendBookingConfirmedTenant, sendNewBookingOwner } from "@/lib/email"
import { withHandler } from "@/lib/handler"

export const POST = withHandler(async (req: Request) => {
  const { bookingId } = await req.json()

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tenant:   { select: { name: true, email: true, phone: true } },
      property: { select: { name: true, city: true, whatsapp: true, owner: { select: { name: true, email: true } } } },
      room:     { select: { type: true, rent: true } },
    },
  })

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  await Promise.allSettled([
    // Email to tenant
    sendBookingConfirmedTenant({
      tenantName:    booking.tenant.name,
      tenantEmail:   booking.tenant.email,
      propertyName:  booking.property.name,
      propertyCity:  booking.property.city,
      roomType:      booking.room.type,
      rent:          booking.room.rent,
      moveInDate:    booking.moveInDate,
      bookingId:     booking.id,
      ownerWhatsapp: booking.property.whatsapp,
    }),
    // Email to owner
    sendNewBookingOwner({
      ownerName:   booking.property.owner.name,
      ownerEmail:  booking.property.owner.email,
      tenantName:  booking.tenant.name,
      tenantPhone: booking.tenant.phone ?? "",
      tenantEmail: booking.tenant.email,
      propertyName: booking.property.name,
      roomType:    booking.room.type,
      rent:        booking.room.rent,
      moveInDate:  booking.moveInDate,
      bookingId:   booking.id,
      tokenPaid:   booking.tokenPaid,
    }),
  ])

  return NextResponse.json({ success: true })
})
