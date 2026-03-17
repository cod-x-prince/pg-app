export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { SessionUser } from "@/types"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateImageSchema, parseBody } from "@/lib/schemas"
import { withHandler } from "@/lib/handler"

export const POST = withHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const property = await prisma.property.findUnique({ where: { id: params.id } })
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (property.ownerId !== user.id && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = parseBody(CreateImageSchema, await req.json())
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 })

  const image = await prisma.image.create({ data: { propertyId: params.id, ...parsed.data } })
  return NextResponse.json(image, { status: 201 })
})
