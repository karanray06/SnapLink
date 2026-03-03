"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const logger_1 = __importDefault(require("../../infrastructure/logging/logger"));
const MonitoringService_1 = require("../../infrastructure/monitoring/MonitoringService");
class AnalyticsController {
    constructor(getAnalyticsUseCase) {
        this.getAnalyticsUseCase = getAnalyticsUseCase;
    }
    async getStats(req, res) {
        const startTime = Date.now();
        const { shortId } = req.params;
        try {
            const result = await this.getAnalyticsUseCase.execute(shortId);
            MonitoringService_1.monitoring.httpRequestsTotal.inc({ method: 'GET', route: '/api/analytics', status: '200' });
            MonitoringService_1.monitoring.httpRequestDurationSeconds.observe({ method: 'GET', route: '/api/analytics', status: '200' }, (Date.now() - startTime) / 1000);
            res.json(result);
        }
        catch (err) {
            logger_1.default.error({ err, shortId: shortId || 'global' }, '[AnalyticsController] Failed to fetch stats');
            MonitoringService_1.monitoring.httpRequestsTotal.inc({ method: 'GET', route: '/api/analytics', status: '500' });
            res.status(500).json({ error: 'Failed to fetch analytics' });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
