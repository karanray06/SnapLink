"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresURLRepository = void 0;
class PostgresURLRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async findByShortId(shortId) {
        const res = await this.pool.query('SELECT * FROM url_mappings WHERE short_id = $1', [shortId]);
        if (res.rows.length === 0)
            return null;
        const row = res.rows[0];
        return {
            id: row.id,
            shortId: row.short_id,
            longUrl: row.long_url,
            customAlias: row.custom_alias,
            isActive: row.is_active,
            createdAt: row.created_at,
            expiresAt: row.expires_at,
            password: row.password,
        };
    }
    async save(url) {
        await this.pool.query('INSERT INTO url_mappings (short_id, long_url, custom_alias, is_active, expires_at, password) VALUES ($1, $2, $3, $4, $5, $6)', [url.shortId, url.longUrl, url.customAlias, url.isActive, url.expiresAt, url.password]);
    }
    async update(url) {
        await this.pool.query('UPDATE url_mappings SET long_url = $1, is_active = $2, expires_at = $3, password = $4 WHERE short_id = $5', [url.longUrl, url.isActive, url.expiresAt, url.password, url.shortId]);
    }
    async delete(shortId) {
        await this.pool.query('DELETE FROM url_mappings WHERE short_id = $1', [shortId]);
    }
    async findAll(limit, offset) {
        const res = await this.pool.query('SELECT * FROM url_mappings ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
        return res.rows.map(row => ({
            id: row.id,
            shortId: row.short_id,
            longUrl: row.long_url,
            customAlias: row.custom_alias,
            isActive: row.is_active,
            createdAt: row.created_at,
            expiresAt: row.expires_at,
            password: row.password,
        }));
    }
    async countAll() {
        const res = await this.pool.query('SELECT COUNT(*) FROM url_mappings');
        return parseInt(res.rows[0].count, 10);
    }
}
exports.PostgresURLRepository = PostgresURLRepository;
