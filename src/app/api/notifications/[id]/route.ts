export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withHandler } from "@/lib/handler"
import { markAsRead, deleteNotification } from "@/lib/notifications"
import type { SessionUser } from "@/types"

export const PUT = withHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await markAsRead(params.id, user.id)
  return NextResponse.json({ success: true })
})

export const DELETE = withHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await deleteNotification(params.id, user.id)
  return NextResponse.json({ success: true })
})
