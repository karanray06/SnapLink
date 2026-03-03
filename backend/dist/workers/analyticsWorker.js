"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueAnalyticsEvent = enqueueAnalyticsEvent;
exports.startAnalyticsWorker = startAnalyticsWorker;
const postgres_1 = require("../db/postgres");
const redis_1 = __importStar(require("../db/redis"));
const ua_parser_js_1 = require("ua-parser-js");
const PostgresWebhookRepository_1 = require("../infrastructure/database/PostgresWebhookRepository");
const WebhookService_1 = require("../application/services/WebhookService");
const postgres_2 = __importDefault(require("../db/postgres"));
const QUEUE_KEY = 'analytics:queue';
const webhookRepository = new PostgresWebhookRepository_1.PostgresWebhookRepository(postgres_2.default);
const webhookService = new WebhookService_1.WebhookService(webhookRepository);
/**
 * Producer: Push raw event data to Redis queue.
 */
async function enqueueAnalyticsEvent(event) {
    await redis_1.default.lpush(QUEUE_KEY, JSON.stringify(event));
}
/**
 * Worker to process click analytics asynchronously.
 * Pulls raw event data from Redis and persists to PostgreSQL.
 */
async function startAnalyticsWorker() {
    console.log('[Worker] Analytics worker started');
    const workerRedis = (0, redis_1.createRedisClient)();
    while (true) {
        try {
            // Block until an item is available in the list
            const result = await workerRedis.brpop(QUEUE_KEY, 0);
            if (!result)
                continue;
            const [_key, data] = result;
            const event = JSON.parse(data);
            const parser = new ua_parser_js_1.UAParser(event.userAgent);
            const uaResult = parser.getResult();
            await (0, postgres_1.query)(`INSERT INTO click_analytics (short_id, ip_address, user_agent, referrer, browser, os, device_type)
         VALUES ($1, $2::inet, $3, $4, $5, $6, $7)`, [
                event.shortId,
                event.ipAddress,
                event.userAgent,
                event.referrer || null,
                uaResult.browser.name || 'Unknown',
                uaResult.os.name || 'Unknown',
                uaResult.device.type || 'desktop',
            ]);
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
        }
        catch (err) {
            console.error('[Worker] Error processing analytics:', err);
            // Wait a bit before retrying if there's a serious error
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
}
