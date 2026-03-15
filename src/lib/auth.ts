import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rateLimit"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours — sessions expire daily
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // ── Rate limit: 10 login attempts per IP per 15 minutes ─────────
        const ip = (req as any)?.headers?.["x-forwarded-for"] ?? "unknown"
        const rl = await rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)
        if (!rl.success) throw new Error("Too many login attempts. Wait 15 minutes.")

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        // ── Constant-time comparison prevents timing attacks ────────────
        // Always run bcrypt even if user not found (prevents user enumeration)
        const dummyHash = "$2a$12$dummy.hash.to.prevent.timing.attack.on.user.enum"
        const isValid = user
          ? await bcrypt.compare(credentials.password, user.passwordHash)
          : await bcrypt.compare(credentials.password, dummyHash)

        if (!user || !isValid) return null

        return {
          id:         user.id,
          email:      user.email,
          name:       user.name,
          role:       user.role,
          isApproved: user.isApproved,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role       = (user as any).role
        token.isApproved = (user as any).isApproved
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // ── Re-fetch isApproved from DB on every session refresh ────────
        // This ensures revoked approvals take effect immediately
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isApproved: true, role: true }
        })
        ;(session.user as any).id         = token.sub
        ;(session.user as any).role       = freshUser?.role       ?? token.role
        ;(session.user as any).isApproved = freshUser?.isApproved ?? token.isApproved
      }
      return session
    },
  },
  // ── Secure cookie settings ─────────────────────────────────────────────
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}
