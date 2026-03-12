import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const revalidate = 3600 // cache for 1 hour

export async function GET() {
  const [totalProperties, totalBookings, totalUsers, ratingAgg] = await Promise.all([
    prisma.property.count({ where: { isActive: true } }),
    prisma.booking.count({ where: { status: { in: ["CONFIRMED", "COMPLETED"] } } }),
    prisma.user.count({ where: { role: "TENANT" } }),
    prisma.review.aggregate({ _avg: { rating: true } }),
  ])

  const cities = await prisma.property.groupBy({
    by: ["city"],
    where: { isActive: true },
    _count: true,
  })

  return NextResponse.json({
    totalProperties,
    totalBookings,
    totalTenants: totalUsers,
    avgRating: ratingAgg._avg.rating ?? 0,
    citiesCount: cities.length,
    cities: cities.map(c => ({ city: c.city, count: c._count })),
  })
}
