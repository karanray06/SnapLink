import { Redis } from "@upstash/redis";
import { getClientIp } from "./utils";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiting: 20 requests per minute per IP using sliding window
export async function checkRateLimit(
  identifier: string,
  limit: number = 20,
  windowMs: number = 60000 // 1 minute
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get all requests in the current window
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart); // Remove old entries
  pipeline.zcard(key); // Count remaining entries
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` }); // Add current request
  pipeline.expire(key, Math.ceil(windowMs / 1000)); // Set expiry

  const results = await pipeline.exec();
  const count = (results[1] as number) + 1;

  if (count > limit) {
    const oldestEntries = await redis.zrange(key, 0, 0, { withScores: true }) as any[];
    const resetAt = oldestEntries.length >= 2 ? (oldestEntries[1] as number) : now;
    return {
      allowed: false,
      remaining: 0,
      resetAt: resetAt + windowMs,
    };
  }

  return {
    allowed: true,
    remaining: limit - count,
    resetAt: now + windowMs,
  };
}

// Cache operations
export async function getCachedUrl(shortId: string) {
  return redis.get(`url:${shortId}`);
}

export async function setCachedUrl(
  shortId: string,
  data: {
    longUrl: string;
    expiresAt: string | null;
  },
  ttlSeconds: number = 86400 // 24 hours
) {
  return redis.setex(`url:${shortId}`, ttlSeconds, JSON.stringify(data));
}

export async function deleteCachedUrl(shortId: string) {
  return redis.del(`url:${shortId}`);
}

// Cache redirect count
export async function incrementClickCache(shortId: string) {
  return redis.incr(`clicks:${shortId}`);
}

export async function getClickCache(shortId: string) {
  const count = await redis.get(`clicks:${shortId}`);
  return count ? parseInt(count as string) : 0;
}

// Flush click cache to database periodically
export async function deleteClickCache(shortId: string) {
  return redis.del(`clicks:${shortId}`);
}
