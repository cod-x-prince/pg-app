import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// On Vercel, each serverless function can spawn its own connection.
// Supabase free tier = 60 connections max.
// Solution: use connection_limit=1 so each function uses 1 pooled connection.
// In production, prepend ?pgbouncer=true&connection_limit=1 to DATABASE_URL
// e.g. postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
