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
exports.WebhookService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../../infrastructure/logging/logger"));
const crypto = __importStar(require("crypto"));
class WebhookService {
    constructor(webhookRepository) {
        this.webhookRepository = webhookRepository;
    }
    async trigger(eventType, payload) {
        try {
            const subscriptions = await this.webhookRepository.findActiveByEventType(eventType);
            for (const sub of subscriptions) {
                this.dispatch(sub, payload).catch(err => logger_1.default.error({ err, subscriptionId: sub.id }, 'Webhook dispatch failed'));
            }
        }
        catch (err) {
            logger_1.default.error({ err, eventType }, 'Failed to trigger webhooks');
        }
    }
    async dispatch(sub, payload) {
        const headers = { 'Content-Type': 'application/json' };
        if (sub.secret) {
            const signature = crypto
                .createHmac('sha256', sub.secret)
                .update(JSON.stringify(payload))
                .digest('hex');
            headers['X-SnapLink-Signature'] = signature;
        }
        await axios_1.default.post(sub.targetUrl, payload, { headers, timeout: 5000 });
        logger_1.default.info({ subscriptionId: sub.id, url: sub.targetUrl }, 'Webhook dispatched successfully');
    }
}
exports.WebhookService = WebhookService;
