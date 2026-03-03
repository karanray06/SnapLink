import { Request, Response } from 'express';
import { GetAnalyticsUseCase } from '../../application/use-cases/GetAnalyticsUseCase';
import logger from '../../infrastructure/logging/logger';
import { monitoring } from '../../infrastructure/monitoring/MonitoringService';

export class AnalyticsController {
    constructor(private getAnalyticsUseCase: GetAnalyticsUseCase) { }

    async getStats(req: Request, res: Response): Promise<void> {
        const startTime = Date.now();
        const { shortId } = req.params;
        try {
            const result = await this.getAnalyticsUseCase.execute(shortId as string);

            monitoring.httpRequestsTotal.inc({ method: 'GET', route: '/api/analytics', status: '200' });
            monitoring.httpRequestDurationSeconds.observe({ method: 'GET', route: '/api/analytics', status: '200' }, (Date.now() - startTime) / 1000);

            res.json(result);
        } catch (err: any) {
            logger.error({ err, shortId: shortId || 'global' }, '[AnalyticsController] Failed to fetch stats');
            monitoring.httpRequestsTotal.inc({ method: 'GET', route: '/api/analytics', status: '500' });
            res.status(500).json({ error: 'Failed to fetch analytics' });
        }
    }
}
