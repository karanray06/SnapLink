import { WebhookSubscription } from '../entities/WebhookSubscription';

export interface IWebhookRepository {
    findActiveByEventType(eventType: string): Promise<WebhookSubscription[]>;
    save(sub: WebhookSubscription): Promise<void>;
}
