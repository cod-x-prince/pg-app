import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rateLimit"
import { ALLOWED_GENDERS, ALLOWED_AMENITIES } from "@/lib/validation"
import { CreatePropertySchema, parseBody } from "@/lib/schemas"
import { withHandler } from "@/lib/handler"

export const GET = withHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url)
  const city      = searchParams.get("city")
  const gender    = searchParams.get("gender")
  const minRent   = searchParams.get("minRent")
  const maxRent   = searchParams.get("maxRent")
  const amenities = searchParams.get("amenities")?.split(",").filter(Boolean) || []
  const sort      = searchParams.get("sort") || "newest"

  const safeGender    = gender && ALLOWED_GENDERS.includes(gender) ? gender : null
  const safeMinRent   = minRent ? Math.max(0, Math.min(parseInt(minRent) || 0, 500000)) : null
  const safeMaxRent   = maxRent ? Math.max(0, Math.min(parseInt(maxRent) || 500000, 500000)) : null
  const safeAmenities = amenities.filter(a => ALLOWED_AMENITIES.includes(a))

  const where: any = { isActive: true }
  if (city) where.city = { equals: city, mode: "insensitive" }
  if (safeGender) where.gender = safeGender
  if (safeAmenities.length) where.amenities = { some: { name: { in: safeAmenities } } }
  if (safeMinRent !== null || safeMaxRent !== null) {
    where.rooms = { some: { rent: {
      ...(safeMinRent !== null && { gte: safeMinRent }),
      ...(safeMaxRent !== null && { lte: safeMaxRent }),
    }}}
  }

  const orderBy: any = sort === "price_asc" ? { rooms: { _count: "asc" } } : { createdAt: "desc" }

  const page  = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"))
  const skip  = (page - 1) * limit

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where, orderBy, skip, take: limit,
      include: {
        images:    { take: 3 },
        rooms:     { select: { rent: true, isAvailable: true } },
        reviews:   { select: { rating: true } },
        amenities: true,
        _count:    { select: { likes: true } },
      },
    }),
    prisma.property.count({ where }),
  ])

  return NextResponse.json({ properties, total, page, pages: Math.ceil(total / limit) })
})

export const POST = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || !["OWNER", "BROKER", "ADMIN"].includes(user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!user.isApproved)
    return NextResponse.json({ error: "Account pending approval" }, { status: 403 })

  const rl = await rateLimit(`create-listing:${user.id}`, 10, 24 * 60 * 60 * 1000)
  if (!rl.success)
    return NextResponse.json({ error: "Too many listings created today." }, { status: 429 })

  const parsed = parseBody(CreatePropertySchema, await req.json())
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 })

  const { name, description, city, address, gender, whatsapp, lat, lng } = parsed.data
  const property = await prisma.property.create({
    data: { ownerId: user.id, name, description, city, address, gender: gender as any, whatsapp: whatsapp ?? null, lat: lat ?? null, lng: lng ?? null },
  })
  return NextResponse.json(property, { status: 201 })
})
