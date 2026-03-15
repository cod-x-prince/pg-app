export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminPropertySchema, parseBody } from "@/lib/schemas"
import { withHandler } from "@/lib/handler"

export const PUT = withHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = parseBody(AdminPropertySchema, await req.json())
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 })

  const updated = await prisma.property.update({
    where: { id: params.id },
    data:  parsed.data,
    select: { id: true, isVerified: true, isActive: true },
  })
  return NextResponse.json(updated)
})
