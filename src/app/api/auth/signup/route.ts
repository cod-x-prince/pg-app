export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rateLimit"
import { sanitizeString } from "@/lib/validation"
import { sanitizeText, sanitizeWhatsAppNumber } from "@/lib/sanitize"
import { logger } from "@/lib/logger"
import { SignupSchema, parseBody } from "@/lib/schemas"

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const rl = await rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)
    if (!rl.success)
      return NextResponse.json({ error: "Too many signup attempts. Try again later." }, { status: 429 })

    const parsed = parseBody(SignupSchema, await req.json())
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error }, { status: 400 })

    const { name, email, password, phone, role } = parsed.data

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 })

    // IMPROVED PHONE VALIDATION: Use proper sanitization
    const sanitizedPhone = phone ? sanitizeWhatsAppNumber(phone) : null
    if (phone && !sanitizedPhone) {
      return NextResponse.json(
        { error: "Invalid phone number. Must be a valid 10-digit Indian mobile number." },
        { status: 400 }
      )
    }

    // Security: Use 14 rounds (OWASP recommendation) instead of 12
    const passwordHash = await bcrypt.hash(password, 14)

    const user = await prisma.user.create({
      data: {
        name: sanitizeText(sanitizeString(name, 100)),
        email,
        phone: sanitizedPhone,
        passwordHash,
        role: role as any,
        isApproved: role === "TENANT",
      },
      select: { id: true, role: true, isApproved: true },
    })

    // Send welcome email (non-blocking, log failures for retry)
    try {
      const { sendWelcomeEmail } = await import("@/lib/email")
      await sendWelcomeEmail({
        name:  sanitizeText(sanitizeString(name, 100)),
        email,
        role,
      })
    } catch (emailError) {
      // Log email failure for manual retry/investigation
      logger.error("[Signup] Failed to send welcome email", emailError, {
        userId: user.id,
        email,
      });
      // TODO: Store in failed_emails table for retry queue
    }

    return NextResponse.json({ success: true, role: user.role, isApproved: user.isApproved })
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
