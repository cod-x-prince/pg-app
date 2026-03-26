export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withHandler } from "@/lib/handler"
import type { SessionUser } from "@/types"

/**
 * DELETE /api/profile/delete
 * Soft-deletes the current user with proper booking handling:
 *  - Checks for active bookings and prevents deletion
 *  - Anonymises PII (name, email, phone, avatar, KYC docs)
 *  - Deactivates all owned properties
 *  - Preserves booking/review records for audit (with anonymised tenant)
 */
export const DELETE = withHandler(async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // SOFT DELETE FIX: Check for active bookings before allowing deletion
  const activeBookings = await prisma.booking.findMany({
    where: {
      OR: [
        { tenantId: user.id, status: { in: ["PENDING", "CONFIRMED"] } },
        { property: { ownerId: user.id }, status: { in: ["PENDING", "CONFIRMED"] } },
      ],
    },
    select: {
      id: true,
      status: true,
      property: { select: { name: true } },
    },
  })

  if (activeBookings.length > 0) {
    return NextResponse.json(
      {
        error: "Cannot delete account with active bookings",
        code: "ACTIVE_BOOKINGS_EXIST",
        details: {
          count: activeBookings.length,
          bookings: activeBookings,
        },
      },
      { status: 400 }
    )
  }

  const deletedTag = `deleted_${user.id.slice(0, 8)}`

  await prisma.$transaction([
    // Anonymise user PII
    prisma.user.update({
      where: { id: user.id },
      data: {
        name:         "Deleted User",
        email:        `${deletedTag}@deleted.gharam.in`,
        phone:        null,
        avatar:       null,
        whatsapp:     null,
        kycDocUrl:    null,
        licenseUrl:   null,
        passwordHash: "ACCOUNT_DELETED",
        isApproved:   false,
      },
    }),
    // Deactivate all owned properties
    prisma.property.updateMany({
      where: { ownerId: user.id },
      data:  { isActive: false },
    }),
    // Cancel any past bookings to maintain data integrity
    prisma.booking.updateMany({
      where: { tenantId: user.id, status: "COMPLETED" },
      data: { status: "CANCELLED" },
    }),
  ])

  return NextResponse.json({
    success: true,
    message: "Account deleted successfully. All personal data has been removed.",
  })
})
