"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisClient = exports.CACHE_DEFAULT_TTL = void 0;
exports.getCachedUrl = getCachedUrl;
exports.setCachedUrl = setCachedUrl;
exports.invalidateCachedUrl = invalidateCachedUrl;
exports.checkRateLimit = checkRateLimit;
exports.deleteCachedUrl = deleteCachedUrl;
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
});
redis.on('connect', () => console.log('[Redis] Connected'));
redis.on('error', (err) => console.error('[Redis] Error:', err.message));
exports.CACHE_DEFAULT_TTL = parseInt(process.env.CACHE_DEFAULT_TTL || '86400', 10);
/**
 * Get a cached long URL for a given short ID.
 */
async function getCachedUrl(shortId) {
    return redis.get(`url:${shortId}`);
}
/**
 * Set a URL in the cache with an optional TTL.
 * Uses allkeys-lru on the Redis server level for eviction.
 */
async function setCachedUrl(shortId, longUrl, ttlSeconds) {
    const ttl = ttlSeconds ?? exports.CACHE_DEFAULT_TTL;
    await redis.setex(`url:${shortId}`, ttl, longUrl);
}
/**
 * Invalidate a URL from cache (e.g., on deletion or expiry).
 */
async function invalidateCachedUrl(shortId) {
    await redis.del(`url:${shortId}`);
}
/**
 * Rate limit: sliding window counter.
 * Returns [currentCount, isLimited]
 */
async function checkRateLimit(key, windowSeconds, maxRequests) {
    const redisKey = `rl:${key}`;
    const pipeline = redis.pipeline();
    pipeline.incr(redisKey);
    pipeline.expire(redisKey, windowSeconds);
    const results = await pipeline.exec();
    const count = results?.[0]?.[1] ?? 0;
    return { count, limited: count > maxRequests };
}
async function deleteCachedUrl(shortId) {
    const key = `url:${shortId}`;
    await redis.del(key);
}
const createRedisClient = () => {
    return new ioredis_1.default(redisUrl, {
        maxRetriesPerRequest: null, // Allow blocking commands
        enableReadyCheck: true,
        lazyConnect: false,
    });
};
exports.createRedisClient = createRedisClient;
exports.default = redis;
