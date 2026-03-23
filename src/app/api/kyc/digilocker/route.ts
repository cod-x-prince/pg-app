import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import type { SessionUser } from "@/types"

export async function POST() {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Simulate DigiLocker OAuth fetch and verification
  await new Promise(resolve => setTimeout(resolve, 800))

  await prisma.user.update({
    where: { id: user.id },
    data: {
      kycStatus: "APPROVED",
      kycDocUrl: "digilocker_verified_mock_token_12345",
    },
  })

  return NextResponse.json({ success: true })
}
