export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withHandler } from "@/lib/handler"
import { getUnreadCount } from "@/lib/notifications"
import type { SessionUser } from "@/types"

export const GET = withHandler(async () => {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const count = await getUnreadCount(user.id)
  return NextResponse.json({ count })
})
