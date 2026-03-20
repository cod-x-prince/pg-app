export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withHandler } from "@/lib/handler"
import { z } from "zod"
import type { SessionUser } from "@/types"

const UpdateProfileSchema = z.object({
  name:      z.string().min(2).max(100).trim().optional(),
  phone:     z.string().regex(/^[6-9]\d{9}$/, "Invalid phone").optional().nullable(),
  whatsapp:  z.string().regex(/^[6-9]\d{9}$/, "Invalid WhatsApp").optional().nullable(),
  avatar:    z.string().url().optional().nullable(),
})

export const GET = withHandler(async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, phone: true, whatsapp: true, avatar: true, role: true, createdAt: true, kycStatus: true },
  })
  return NextResponse.json(profile)
})

export const PATCH = withHandler(async (req: Request) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateProfileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, phone: true, whatsapp: true, avatar: true },
  })
  return NextResponse.json(updated)
})
