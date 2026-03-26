export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rateLimit"
import { verifyResetToken, invalidateResetToken } from "@/lib/passwordReset"
import { withHandler } from "@/lib/handler"
import { logger } from "@/lib/logger"
import bcrypt from "bcryptjs"
import { z } from "zod"

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
})

/**
 * POST /api/auth/reset-password
 * Reset password with token
 * Rate limited: 5 attempts per IP per hour
 */
export const POST = withHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  
  // Rate limiting to prevent brute force token guessing
  const rl = await rateLimit(`reset-password:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many password reset attempts. Please try again later." },
      { status: 429 }
    )
  }

  const body = await req.json()
  const result = ResetPasswordSchema.safeParse(body)
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const { token, password } = result.data

  // Verify token
  const verification = await verifyResetToken(token)
  if (!verification.valid || !verification.email) {
    return NextResponse.json(
      { error: verification.error || "Invalid token" },
      { status: 400 }
    )
  }

  // Hash new password (14 rounds for security)
  const passwordHash = await bcrypt.hash(password, 14)

  // Update user password
  try {
    await prisma.user.update({
      where: { email: verification.email },
      data: { passwordHash },
    })

    // Invalidate the reset token
    await invalidateResetToken(token)

    logger.info("Password reset successful", { email: verification.email })

    return NextResponse.json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    })
  } catch (error) {
    logger.error("Failed to reset password", error, { email: verification.email })
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
})
