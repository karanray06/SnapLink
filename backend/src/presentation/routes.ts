import { Router } from 'express';
import { URLController } from './controllers/URLController';
import { AnalyticsController } from './controllers/AnalyticsController';
import { ShortenURLUseCase } from '../application/use-cases/ShortenURLUseCase';
import { RedirectURLUseCase } from '../application/use-cases/RedirectURLUseCase';
import { GetAnalyticsUseCase } from '../application/use-cases/GetAnalyticsUseCase';
import { ValidatePasswordUseCase } from '../application/use-cases/ValidatePasswordUseCase';
import { PostgresURLRepository } from '../infrastructure/database/PostgresURLRepository';
import { PostgresAnalyticsRepository } from '../infrastructure/database/PostgresAnalyticsRepository';
import { PostgresAPIKeyRepository } from '../infrastructure/database/PostgresAPIKeyRepository';
import { apiKeyValidator } from './middlewares/apiKeyValidator';
import { kgsService } from '../application/services/KGSService';
import pool from '../db/postgres';
import { monitoring } from '../infrastructure/monitoring/MonitoringService';

const router = Router();

// Dependency Injection Initializations
const urlRepository = new PostgresURLRepository(pool);
const analyticsRepository = new PostgresAnalyticsRepository(pool);
const apiKeyRepository = new PostgresAPIKeyRepository(pool);

const shortenUseCase = new ShortenURLUseCase(urlRepository, () => kgsService.getNextShortId());
const redirectUseCase = new RedirectURLUseCase(urlRepository);
const analyticsUseCase = new GetAnalyticsUseCase(analyticsRepository);
const validatePasswordUseCase = new ValidatePasswordUseCase(urlRepository);

const urlController = new URLController(shortenUseCase, redirectUseCase, validatePasswordUseCase);
const analyticsController = new AnalyticsController(analyticsUseCase);

const authMiddleware = apiKeyValidator(apiKeyRepository);

// Routes
router.post('/shorten', authMiddleware, (req, res) => urlController.shorten(req, res));
router.get('/analytics', authMiddleware, (req, res) => analyticsController.getStats(req, res)); // Protect global analytics too
router.get('/analytics/:shortId', (req, res) => analyticsController.getStats(req, res));

// Monitoring
router.get('/metrics', async (req, res) => {
    res.set('Content-Type', monitoring.contentType);
    res.end(await monitoring.getMetrics());
});

// Health Check (Enterprise version)
router.get('/health', (req, res) => {
    res.json({
        status: 'up',
        timestamp: new Date().toISOString(),
        version: '2.0.0-enterprise',
        region: process.env.REGION || 'mumbai',
    });
});

export default router;
export { urlController };
