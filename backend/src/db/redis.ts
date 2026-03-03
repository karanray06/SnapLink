import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
});

redis.on('connect', () => console.log('[Redis] Connected'));
redis.on('error', (err) => console.error('[Redis] Error:', err.message));

export const CACHE_DEFAULT_TTL = parseInt(
    process.env.CACHE_DEFAULT_TTL || '86400',
    10
);

/**
 * Get a cached long URL for a given short ID.
 */
export async function getCachedUrl(shortId: string): Promise<string | null> {
    return redis.get(`url:${shortId}`);
}

/**
 * Set a URL in the cache with an optional TTL.
 * Uses allkeys-lru on the Redis server level for eviction.
 */
export async function setCachedUrl(
    shortId: string,
    longUrl: string,
    ttlSeconds?: number
): Promise<void> {
    const ttl = ttlSeconds ?? CACHE_DEFAULT_TTL;
    await redis.setex(`url:${shortId}`, ttl, longUrl);
}

/**
 * Invalidate a URL from cache (e.g., on deletion or expiry).
 */
export async function invalidateCachedUrl(shortId: string): Promise<void> {
    await redis.del(`url:${shortId}`);
}

/**
 * Rate limit: sliding window counter.
 * Returns [currentCount, isLimited]
 */
export async function checkRateLimit(
    key: string,
    windowSeconds: number,
    maxRequests: number
): Promise<{ count: number; limited: boolean }> {
    const redisKey = `rl:${key}`;
    const pipeline = redis.pipeline();
    pipeline.incr(redisKey);
    pipeline.expire(redisKey, windowSeconds);
    const results = await pipeline.exec();
    const count = (results?.[0]?.[1] as number) ?? 0;
    return { count, limited: count > maxRequests };
}

export async function deleteCachedUrl(shortId: string): Promise<void> {
    const key = `url:${shortId}`;
    await redis.del(key);
}

export const createRedisClient = () => {
    return new Redis(redisUrl, {
        maxRetriesPerRequest: null, // Allow blocking commands
        enableReadyCheck: true,
        lazyConnect: false,
    });
};

export default redis;
