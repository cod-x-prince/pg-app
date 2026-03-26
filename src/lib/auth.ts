import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rateLimit"
import { toSessionUser, getUserFromToken } from "@/lib/typeGuards"
import bcrypt from "bcryptjs"
import crypto from "crypto"

// Generate a random dummy hash at runtime (not hardcoded)
const DUMMY_HASH = `$2a$14$${crypto.randomBytes(32).toString("base64").slice(0, 53)}`

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
    // Google OAuth — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in env
    ...(process.env.GOOGLE_CLIENT_ID ? [
      GoogleProvider({
        clientId:     process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        profile(profile) {
          return {
            id:         profile.sub,
            name:       profile.name,
            email:      profile.email,
            image:      profile.picture,
            role:       "TENANT" as const,
            isApproved: true,
          }
        },
      }),
    ] : []),
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
        // Use random dummy hash generated at startup (not hardcoded)
        const isValid = user
          ? await bcrypt.compare(credentials.password, user.passwordHash)
          : await bcrypt.compare(credentials.password, DUMMY_HASH)

        if (!user || !isValid) return null

        const sessionUser = toSessionUser(user);
        if (!sessionUser) return null;

        return sessionUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const sessionUser = toSessionUser(user);
        if (sessionUser) {
          token.id         = sessionUser.id;
          token.role       = sessionUser.role;
          token.isApproved = sessionUser.isApproved;
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const tokenData = getUserFromToken(token);
        if (!tokenData) return session;

        // ── Re-fetch isApproved from DB periodically (cached with stale-while-revalidate) ─────
        // Only refresh every 5 minutes to reduce database load
        const shouldRefresh = !token.lastRefresh || 
          (Date.now() - (token.lastRefresh as number)) > 5 * 60 * 1000;

        let freshApprovalStatus = tokenData.isApproved;
        let freshRole = tokenData.role;

        if (shouldRefresh) {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { isApproved: true, role: true },
          });
          
          if (freshUser) {
            freshApprovalStatus = freshUser.isApproved;
            freshRole = freshUser.role as any;
            token.lastRefresh = Date.now();
          }
        }

        (session.user as any).id         = tokenData.id;
        (session.user as any).role       = freshRole;
        (session.user as any).isApproved = freshApprovalStatus;
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
