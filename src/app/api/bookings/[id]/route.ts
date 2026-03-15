export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdateBookingSchema, parseBody } from "@/lib/schemas"
import { withHandler } from "@/lib/handler"

export const PUT = withHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = parseBody(UpdateBookingSchema, await req.json())
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 })

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { property: { select: { ownerId: true } } },
  })
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (booking.property.ownerId !== user.id && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (["COMPLETED", "CANCELLED"].includes(booking.status))
    return NextResponse.json({ error: "Cannot modify a closed booking" }, { status: 400 })

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data:  { status: parsed.data.status as any },
    select: { id: true, status: true },
  })
  return NextResponse.json(updated)
})
