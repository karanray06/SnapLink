"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresWebhookRepository = void 0;
class PostgresWebhookRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async findActiveByEventType(eventType) {
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
    async save(sub) {
        const query = `
            INSERT INTO webhook_subscriptions (owner_name, target_url, event_type, secret)
            VALUES ($1, $2, $3, $4)
        `;
        await this.pool.query(query, [sub.ownerName, sub.targetUrl, sub.eventType, sub.secret]);
    }
}
exports.PostgresWebhookRepository = PostgresWebhookRepository;
