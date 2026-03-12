import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdatePropertySchema, parseBody } from "@/lib/schemas"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      images:    true,
      videos:    true,
      rooms:     true,
      amenities: true,
      reviews:   {
        include: { tenant: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      owner: { select: { id: true, name: true, phone: true } },
      _count: { select: { likes: true } },
    },
  })
  if (!property || !property.isActive)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(property)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const property = await prisma.property.findUnique({ where: { id: params.id } })
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (property.ownerId !== user.id && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = parseBody(UpdatePropertySchema, await req.json())
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 })

  const updated = await prisma.property.update({
    where: { id: params.id },
    data: parsed.data as any,
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const property = await prisma.property.findUnique({ where: { id: params.id } })
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (property.ownerId !== user.id && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.property.update({ where: { id: params.id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
