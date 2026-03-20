export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ApproveOwnerSchema, parseBody } from "@/lib/schemas"
import { withHandler } from "@/lib/handler"
import type { SessionUser } from "@/types"

export const PUT = withHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user || user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = parseBody(ApproveOwnerSchema, await req.json())
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id: params.id },
    data:  { isApproved: parsed.data.approved },
    select: { id: true, isApproved: true },
  })
  // Send approval email if approved (non-blocking)
  if (parsed.data.approved) {
    try {
      const owner = await prisma.user.findUnique({ where: { id: params.id }, select: { name: true, email: true } })
      if (owner) {
        const { sendOwnerApprovedEmail } = await import("@/lib/email")
        await sendOwnerApprovedEmail({ name: owner.name, email: owner.email })
      }
    } catch { /* email failure should not block approval */ }
  }

  return NextResponse.json(updated)
})
