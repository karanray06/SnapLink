import { Pool } from 'pg';
import { IWebhookRepository } from '../../domain/repositories/IWebhookRepository';
import { WebhookSubscription } from '../../domain/entities/WebhookSubscription';

export class PostgresWebhookRepository implements IWebhookRepository {
    constructor(private pool: Pool) { }

    async findActiveByEventType(eventType: string): Promise<WebhookSubscription[]> {
        const query = 'SELECT * FROM webhook_subscriptions WHERE event_type = $1 AND is_active = TRUE';
        const { rows } = await this.pool.query(query, [eventType]);

        return rows.map(row => ({
            id: row.id,
            ownerName: row.owner_name,
            targetUrl: row.target_url,
            eventType: row.event_type,
            isActive: row.is_active,
            secret: row.secret,
        }));
    }

    async save(sub: WebhookSubscription): Promise<void> {
        const query = `
            INSERT INTO webhook_subscriptions (owner_name, target_url, event_type, secret)
            VALUES ($1, $2, $3, $4)
        `;
        await this.pool.query(query, [sub.ownerName, sub.targetUrl, sub.eventType, sub.secret]);
    }
}
