export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rateLimit"
import { createPasswordResetToken } from "@/lib/passwordReset"
import { withHandler } from "@/lib/handler"
import { logger } from "@/lib/logger"
import { z } from "zod"

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
})

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 * Rate limited: 3 attempts per IP per hour
 */
export const POST = withHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  
  // Strict rate limiting to prevent abuse
  const rl = await rateLimit(`forgot-password:${ip}`, 3, 60 * 60 * 1000)
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many password reset attempts. Please try again in 1 hour." },
      { status: 429 }
    )
  }

  const body = await req.json()
  const result = ForgotPasswordSchema.safeParse(body)
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const { email } = result.data

  // Always return success to prevent user enumeration
  // Check if user exists internally but don't reveal to client
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  })

  if (user) {
    try {
      // Generate reset token
      const token = await createPasswordResetToken(email)

      // Send reset email
      const { sendPasswordResetEmail } = await import("@/lib/email")
      await sendPasswordResetEmail({
        name: user.name,
        email: user.email,
        token,
      })

      logger.info("Password reset email sent", { email, userId: user.id })
    } catch (error) {
      logger.error("Failed to send password reset email", error, { email })
      // Don't reveal error to user
    }
  } else {
    logger.warn("Password reset requested for non-existent email", { email })
    // Still return success to prevent enumeration
  }

  return NextResponse.json({
    success: true,
    message: "If an account exists with that email, you will receive a password reset link.",
  })
})
