import axios from 'axios';
import { IWebhookRepository } from '../../domain/repositories/IWebhookRepository';
import logger from '../../infrastructure/logging/logger';
import * as crypto from 'crypto';

export class WebhookService {
    constructor(private webhookRepository: IWebhookRepository) { }

    async trigger(eventType: string, payload: any): Promise<void> {
        try {
            const subscriptions = await this.webhookRepository.findActiveByEventType(eventType);

            for (const sub of subscriptions) {
                this.dispatch(sub, payload).catch(err =>
                    logger.error({ err, subscriptionId: sub.id }, 'Webhook dispatch failed')
                );
            }
        } catch (err) {
            logger.error({ err, eventType }, 'Failed to trigger webhooks');
        }
    }

    private async dispatch(sub: any, payload: any): Promise<void> {
        const headers: any = { 'Content-Type': 'application/json' };

        if (sub.secret) {
            const signature = crypto
                .createHmac('sha256', sub.secret)
                .update(JSON.stringify(payload))
                .digest('hex');
            headers['X-SnapLink-Signature'] = signature;
        }

        await axios.post(sub.targetUrl, payload, { headers, timeout: 5000 });
        logger.info({ subscriptionId: sub.id, url: sub.targetUrl }, 'Webhook dispatched successfully');
    }
}
