import { query } from '../db/postgres';
import redis, { createRedisClient } from '../db/redis';
import { UAParser } from 'ua-parser-js';
import { PostgresWebhookRepository } from '../infrastructure/database/PostgresWebhookRepository';
import { WebhookService } from '../application/services/WebhookService';
import pool from '../db/postgres';

const QUEUE_KEY = 'analytics:queue';

const webhookRepository = new PostgresWebhookRepository(pool);
const webhookService = new WebhookService(webhookRepository);

/**
 * Producer: Push raw event data to Redis queue.
 */
export async function enqueueAnalyticsEvent(event: {
    shortId: string;
    ipAddress: string;
    userAgent: string;
    referrer?: string;
}): Promise<void> {
    await redis.lpush(QUEUE_KEY, JSON.stringify(event));
}

/**
 * Worker to process click analytics asynchronously.
 * Pulls raw event data from Redis and persists to PostgreSQL.
 */
export async function startAnalyticsWorker(): Promise<void> {
    console.log('[Worker] Analytics worker started');
    const workerRedis = createRedisClient();

    while (true) {
        try {
            // Block until an item is available in the list
            const result = await workerRedis.brpop(QUEUE_KEY, 0);
            if (!result) continue;

            const [_key, data] = result;
            const event = JSON.parse(data);

            const parser = new UAParser(event.userAgent);
            const uaResult = parser.getResult();

            await query(
                `INSERT INTO click_analytics (short_id, ip_address, user_agent, referrer, browser, os, device_type)
         VALUES ($1, $2::inet, $3, $4, $5, $6, $7)`,
                [
                    event.shortId,
                    event.ipAddress,
                    event.userAgent,
                    event.referrer || null,
                    uaResult.browser.name || 'Unknown',
                    uaResult.os.name || 'Unknown',
                    uaResult.device.type || 'desktop',
                ]
            );

            // Trigger Webhooks
            webhookService.trigger('url.click', {
                event: 'url.click',
                shortId: event.shortId,
                timestamp: new Date().toISOString(),
                metadata: {
                    ipAddress: event.ipAddress,
                    browser: uaResult.browser.name,
                    os: uaResult.os.name,
                    deviceType: uaResult.device.type || 'desktop'
                }
            });

        } catch (err) {
            console.error('[Worker] Error processing analytics:', err);
            // Wait a bit before retrying if there's a serious error
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
}
