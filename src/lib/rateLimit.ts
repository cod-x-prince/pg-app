import { Redis } from "@upstash/redis"
import { logger } from "@/lib/logger"

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
    // Use Lua script for atomic INCR + EXPIRE operation
    // This prevents race condition where key persists forever if crash occurs between INCR and EXPIRE
    const luaScript = `
      local current = redis.call("INCR", KEYS[1])
      if current == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
      end
      return current
    `
    
    const count = await client.eval(
      luaScript,
      [redisKey],
      [windowSeconds.toString()]
    ) as number

    const remaining = Math.max(0, maxRequests - count)
    return { success: count <= maxRequests, remaining }
  } catch (err) {
    // If Redis is down, fail open — don't block legitimate users
    // Sentry will catch this and alert you
    logger.error("[RateLimit] Redis error, failing open", err)
    return { success: true, remaining: maxRequests }
  }
}
