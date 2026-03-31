import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

// Upstash Redis — persistent rate limiting across all Vercel function instances.
// In-memory Map was resetting on cold starts, allowing bots to bypass limits.
// This persists across all instances and cold starts.

let redis: Redis | null = null;
let redisAvailable = true; // Track if Redis is available
let hasLoggedRedisFailure = false;

function shouldBypassRateLimit(): boolean {
  return (
    process.env.DISABLE_RATE_LIMIT === "true" ||
    process.env.CI === "true" ||
    process.env.NODE_ENV === "test"
  );
}

function getRedis(): Redis | null {
  if (shouldBypassRateLimit()) return null;
  if (!redisAvailable) return null;

  if (!redis) {
    if (
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      redisAvailable = false;
      return null;
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number }> {
  if (shouldBypassRateLimit()) {
    return { success: true, remaining: maxRequests };
  }

  try {
    const client = getRedis();

    // If Redis is not configured/available, skip rate limiting (fail open)
    if (!client) {
      return { success: true, remaining: maxRequests };
    }

    const windowSeconds = Math.ceil(windowMs / 1000);
    const redisKey = `rl:${key}:${Math.floor(Date.now() / windowMs)}`;

    // Use Lua script for atomic INCR + EXPIRE operation
    // This prevents race condition where key persists forever if crash occurs between INCR and EXPIRE
    const luaScript = `
      local current = redis.call("INCR", KEYS[1])
      if current == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
      end
      return current
    `;

    const count = (await client.eval(
      luaScript,
      [redisKey],
      [windowSeconds.toString()],
    )) as number;

    const remaining = Math.max(0, maxRequests - count);
    return { success: count <= maxRequests, remaining };
  } catch {
    // If Redis fails for any reason (network, timeout, etc.), fail open
    // Don't block legitimate users; log once to avoid noisy E2E/CI output
    if (!hasLoggedRedisFailure) {
      logger.warn(
        "[RateLimit] Redis unavailable, rate limiting disabled for this runtime",
      );
      hasLoggedRedisFailure = true;
    }
    redisAvailable = false; // Mark Redis as unavailable to avoid repeated connection attempts
    return { success: true, remaining: maxRequests };
  }
}
