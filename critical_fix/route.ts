import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withHandler } from "@/lib/handler"

// POST — toggle like
export const POST = withHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) return NextResponse.json({ error: "Login to save properties" }, { status: 401 })

  const existing = await prisma.like.findUnique({
    where: { userId_propertyId: { userId: user.id, propertyId: params.id } },
  })

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
    return NextResponse.json({ liked: false })
  }

  await prisma.like.create({ data: { userId: user.id, propertyId: params.id } })
  return NextResponse.json({ liked: true })
})

// GET — check like status
export const GET = withHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) return NextResponse.json({ liked: false })

  const existing = await prisma.like.findUnique({
    where: { userId_propertyId: { userId: user.id, propertyId: params.id } },
  })
  return NextResponse.json({ liked: !!existing })
})
