"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlController = void 0;
const express_1 = require("express");
const URLController_1 = require("./controllers/URLController");
const AnalyticsController_1 = require("./controllers/AnalyticsController");
const ShortenURLUseCase_1 = require("../application/use-cases/ShortenURLUseCase");
const RedirectURLUseCase_1 = require("../application/use-cases/RedirectURLUseCase");
const GetAnalyticsUseCase_1 = require("../application/use-cases/GetAnalyticsUseCase");
const ValidatePasswordUseCase_1 = require("../application/use-cases/ValidatePasswordUseCase");
const PostgresURLRepository_1 = require("../infrastructure/database/PostgresURLRepository");
const PostgresAnalyticsRepository_1 = require("../infrastructure/database/PostgresAnalyticsRepository");
const PostgresAPIKeyRepository_1 = require("../infrastructure/database/PostgresAPIKeyRepository");
const apiKeyValidator_1 = require("./middlewares/apiKeyValidator");
const KGSService_1 = require("../application/services/KGSService");
const postgres_1 = __importDefault(require("../db/postgres"));
const MonitoringService_1 = require("../infrastructure/monitoring/MonitoringService");
const router = (0, express_1.Router)();
// Dependency Injection Initializations
const urlRepository = new PostgresURLRepository_1.PostgresURLRepository(postgres_1.default);
const analyticsRepository = new PostgresAnalyticsRepository_1.PostgresAnalyticsRepository(postgres_1.default);
const apiKeyRepository = new PostgresAPIKeyRepository_1.PostgresAPIKeyRepository(postgres_1.default);
const shortenUseCase = new ShortenURLUseCase_1.ShortenURLUseCase(urlRepository, () => KGSService_1.kgsService.getNextShortId());
const redirectUseCase = new RedirectURLUseCase_1.RedirectURLUseCase(urlRepository);
const analyticsUseCase = new GetAnalyticsUseCase_1.GetAnalyticsUseCase(analyticsRepository);
const validatePasswordUseCase = new ValidatePasswordUseCase_1.ValidatePasswordUseCase(urlRepository);
const urlController = new URLController_1.URLController(shortenUseCase, redirectUseCase, validatePasswordUseCase);
exports.urlController = urlController;
const analyticsController = new AnalyticsController_1.AnalyticsController(analyticsUseCase);
const authMiddleware = (0, apiKeyValidator_1.apiKeyValidator)(apiKeyRepository);
// Routes
router.post('/shorten', authMiddleware, (req, res) => urlController.shorten(req, res));
router.get('/analytics', authMiddleware, (req, res) => analyticsController.getStats(req, res)); // Protect global analytics too
router.get('/analytics/:shortId', (req, res) => analyticsController.getStats(req, res));
// Monitoring
router.get('/metrics', async (req, res) => {
    res.set('Content-Type', MonitoringService_1.monitoring.contentType);
    res.end(await MonitoringService_1.monitoring.getMetrics());
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
exports.default = router;
