import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withHandler } from "@/lib/handler"

export const revalidate = 3600

export const GET = withHandler(async () => {
  const [totalProperties, totalBookings, totalUsers, ratingAgg, cities] = await Promise.all([
    prisma.property.count({ where: { isActive: true } }),
    prisma.booking.count({ where: { status: { in: ["CONFIRMED", "COMPLETED"] } } }),
    prisma.user.count({ where: { role: "TENANT" } }),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.property.groupBy({
      by: ["city"],
      where: { isActive: true },
      _count: true,
      orderBy: { _count: { city: "desc" } },
    }),
  ])

  return NextResponse.json({
    totalProperties,
    totalBookings,
    totalTenants: totalUsers,
    avgRating: ratingAgg._avg.rating ?? 0,
    citiesCount: cities.length,
    cities: cities.map((c: { city: string; _count: number }) => ({ city: c.city, count: c._count })),
  })
})
