export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizeString } from "@/lib/validation";
import { sanitizeText, sanitizeWhatsAppNumber } from "@/lib/sanitize";
import { logger } from "@/lib/logger";
import { SignupSchema, parseBody } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const rawIp = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    const ip = rawIp.split(",")[0].trim();
    const rl = await rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.success)
      return NextResponse.json(
        { error: "Too many signup attempts. Try again later." },
        { status: 429 },
      );

    const body = await req.json();
    const parsed = parseBody(SignupSchema, body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { name, email, password, phone, role } = parsed.data;

    // SECURITY FIX: Verify Turnstile CAPTCHA token
    const turnstileToken = body.turnstileToken;
    if (!turnstileToken && !isDev) {
      return NextResponse.json(
        { error: "CAPTCHA verification required" },
        { status: 400 },
      );
    }

    // Verify token with Cloudflare Turnstile API
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret && !isDev) {
      logger.error("[Signup] TURNSTILE_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (turnstileToken && turnstileSecret) {
      const verifyResponse = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken,
            remoteip: ip,
          }),
        },
      );

      if (!verifyResponse.ok) {
        logger.error("[Signup] Turnstile verification request failed", {
          ip,
          status: verifyResponse.status,
          statusText: verifyResponse.statusText,
        });
        if (!isDev) {
          return NextResponse.json(
            { error: "CAPTCHA verification failed. Please try again." },
            { status: 500 },
          );
        }
      } else {
        const verifyData = await verifyResponse.json();
        if (!verifyData.success) {
          logger.warn("[Signup] Turnstile verification failed", {
            ip,
            errors: verifyData["error-codes"],
          });
          if (!isDev) {
            return NextResponse.json(
              { error: "CAPTCHA verification failed. Please try again." },
              { status: 400 },
            );
          }
        }
      }
    } else if (isDev) {
      logger.warn("[Signup] Turnstile bypassed in development", { ip });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );

    // IMPROVED PHONE VALIDATION: Use proper sanitization
    const sanitizedPhone = phone ? sanitizeWhatsAppNumber(phone) : null;
    if (phone && !sanitizedPhone) {
      return NextResponse.json(
        {
          error:
            "Invalid phone number. Must be a valid 10-digit Indian mobile number.",
        },
        { status: 400 },
      );
    }

    // Security: Use 14 rounds (OWASP recommendation) instead of 12
    const passwordHash = await bcrypt.hash(password, 14);

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
    });

    // Send welcome email (non-blocking, log failures for retry)
    try {
      const { sendWelcomeEmail } = await import("@/lib/email");
      await sendWelcomeEmail({
        name: sanitizeText(sanitizeString(name, 100)),
        email,
        role,
      });
    } catch (emailError) {
      // Log email failure for manual retry/investigation
      logger.error("[Signup] Failed to send welcome email", emailError, {
        userId: user.id,
        email,
      });
      // TODO: Store in failed_emails table for retry queue
    }

    return NextResponse.json({
      success: true,
      role: user.role,
      isApproved: user.isApproved,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
