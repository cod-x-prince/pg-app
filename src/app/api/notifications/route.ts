export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withHandler } from "@/lib/handler"
import { getUserNotifications, markAllAsRead } from "@/lib/notifications"
import type { SessionUser } from "@/types"

export const GET = withHandler(async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notifications = await getUserNotifications(user.id, 50)
  return NextResponse.json(notifications)
})

export const PUT = withHandler(async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await markAllAsRead(user.id)
  return NextResponse.json({ success: true })
})
