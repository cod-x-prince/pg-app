import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ApproveOwnerSchema, parseBody } from "@/lib/schemas"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = parseBody(ApproveOwnerSchema, await req.json())
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { isApproved: parsed.data.approved },
    select: { id: true, isApproved: true },
  })
  return NextResponse.json(updated)
}
