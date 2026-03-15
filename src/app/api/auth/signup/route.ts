import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rateLimit"
import { sanitizeString } from "@/lib/validation"
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

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: sanitizeString(name, 100).trim(),
        email,
        phone: phone?.trim() || null,
        passwordHash,
        role: role as any,
        isApproved: role === "TENANT",
      },
      select: { id: true, role: true, isApproved: true },
    })

    return NextResponse.json({ success: true, role: user.role, isApproved: user.isApproved })
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
