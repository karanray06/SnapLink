"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAnalyticsRepository = void 0;
class PostgresAnalyticsRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async save(event) {
        await this.pool.query(`INSERT INTO click_analytics 
            (short_id, ip_address, user_agent, referrer, browser, os, device_type, country)
            VALUES ($1, $2::inet, $3, $4, $5, $6, $7, $8)`, [
            event.shortId,
            event.ipAddress,
            event.userAgent,
            event.referrer,
            event.browser,
            event.os,
            event.deviceType,
            event.country,
        ]);
    }
    async getGlobalStats() {
        const clicks = await this.pool.query('SELECT COUNT(*) FROM click_analytics');
        const links = await this.pool.query('SELECT COUNT(*) FROM url_mappings');
        return {
            totalClicks: parseInt(clicks.rows[0].count, 10),
            totalLinks: parseInt(links.rows[0].count, 10),
        };
    }
    async getStatsByShortId(shortId) {
        const clicks = await this.pool.query('SELECT COUNT(*) FROM click_analytics WHERE short_id = $1', [shortId]);
        const browsers = await this.pool.query('SELECT browser as name, COUNT(*) as value FROM click_analytics WHERE short_id = $1 GROUP BY browser', [shortId]);
        const os = await this.pool.query('SELECT os as name, COUNT(*) as value FROM click_analytics WHERE short_id = $1 GROUP BY os', [shortId]);
        const deviceTypes = await this.pool.query('SELECT device_type as name, COUNT(*) as value FROM click_analytics WHERE short_id = $1 GROUP BY device_type', [shortId]);
        return {
            totalClicks: parseInt(clicks.rows[0].count, 10),
            browsers: browsers.rows,
            os: os.rows,
            deviceTypes: deviceTypes.rows,
        };
    }
}
exports.PostgresAnalyticsRepository = PostgresAnalyticsRepository;
