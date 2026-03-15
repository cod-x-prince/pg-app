import { Redis } from "@upstash/redis"

// Upstash Redis — persistent rate limiting across all Vercel function instances.
// In-memory Map was resetting on cold starts, allowing bots to bypass limits.
// This persists across all instances and cold starts.

let redis: Redis | null = null

function getRedis(): Redis {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set")
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number }> {
  const client = getRedis()
  const windowSeconds = Math.ceil(windowMs / 1000)
  const redisKey = `rl:${key}:${Math.floor(Date.now() / windowMs)}`

  try {
    const count = await client.incr(redisKey)

    // Set expiry only on first increment to avoid resetting the window
    if (count === 1) {
      await client.expire(redisKey, windowSeconds)
    }

    const remaining = Math.max(0, maxRequests - count)
    return { success: count <= maxRequests, remaining }
  } catch (err) {
    // If Redis is down, fail open — don't block legitimate users
    // Sentry will catch this and alert you
    console.error("[RateLimit] Redis error, failing open:", err)
    return { success: true, remaining: maxRequests }
  }
}
