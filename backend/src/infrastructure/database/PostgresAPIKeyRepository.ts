import { Pool } from 'pg';
import { IAPIKeyRepository } from '../../domain/repositories/IAPIKeyRepository';
import { APIKey } from '../../domain/entities/APIKey';

export class PostgresAPIKeyRepository implements IAPIKeyRepository {
    constructor(private pool: Pool) { }

    async findByHash(keyHash: string): Promise<APIKey | null> {
        const query = 'SELECT * FROM api_keys WHERE key_hash = $1 AND is_active = TRUE';
        const { rows } = await this.pool.query(query, [keyHash]);

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            id: row.id,
            keyHash: row.key_hash,
            ownerName: row.owner_name,
            isActive: row.is_active,
            usageQuota: row.usage_quota,
            usageCount: row.usage_count,
            createdAt: row.created_at,
            lastUsedAt: row.last_used_at,
        };
    }

    async incrementUsage(id: number): Promise<void> {
        const query = 'UPDATE api_keys SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP WHERE id = $1';
        await this.pool.query(query, [id]);
    }

    async save(apiKey: APIKey): Promise<void> {
        const query = `
            INSERT INTO api_keys (key_hash, owner_name, usage_quota)
            VALUES ($1, $2, $3)
        `;
        await this.pool.query(query, [apiKey.keyHash, apiKey.ownerName, apiKey.usageQuota]);
    }
}
