"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLController = void 0;
const logger_1 = __importDefault(require("../../infrastructure/logging/logger"));
const MonitoringService_1 = require("../../infrastructure/monitoring/MonitoringService");
/**
 * @swagger
 * tags:
 *   name: URLs
 *   description: URL Management and Redirection
 */
class URLController {
    constructor(shortenURLUseCase, redirectURLUseCase, validatePasswordUseCase) {
        this.shortenURLUseCase = shortenURLUseCase;
        this.redirectURLUseCase = redirectURLUseCase;
        this.validatePasswordUseCase = validatePasswordUseCase;
    }
    /**
     * @swagger
     * /api/shorten:
     *   post:
     *     summary: Create a shortened URL
     *     tags: [URLs]
     *     security:
     *       - ApiKeyAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - longUrl
     *             properties:
     *               longUrl:
     *                 type: string
     *               customAlias:
     *                 type: string
     *               expiresAt:
     *                 type: string
     *                 format: date-time
     *               password:
     *                 type: string
     *     responses:
     *       201:
     *         description: URL shortened successfully
     *       401:
     *         description: Unauthorized - API Key missing or invalid
     *       400:
     *         description: Bad request
     */
    async shorten(req, res) {
        const startTime = Date.now();
        try {
            const { longUrl, customAlias, expiresAt, password } = req.body;
            const result = await this.shortenURLUseCase.execute({
                longUrl,
                customAlias,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                password
            });
            MonitoringService_1.monitoring.httpRequestsTotal.inc({ method: 'POST', route: '/api/shorten', status: '201' });
            MonitoringService_1.monitoring.httpRequestDurationSeconds.observe({ method: 'POST', route: '/api/shorten', status: '201' }, (Date.now() - startTime) / 1000);
            res.status(201).json({
                shortId: result.shortId,
                shortUrl: `${process.env.BASE_URL}/${result.shortId}`,
                longUrl: result.longUrl,
                expiresAt: result.expiresAt,
                createdAt: result.createdAt,
            });
        }
        catch (err) {
            logger_1.default.error({ err }, '[URLController] Shorten failed');
            MonitoringService_1.monitoring.httpRequestsTotal.inc({ method: 'POST', route: '/api/shorten', status: '400' });
            res.status(400).json({ error: err.message });
        }
    }
    /**
     * @swagger
     * /{shortId}:
     *   get:
     *     summary: Redirect to the original URL
     *     tags: [URLs]
     *     parameters:
     *       - in: path
     *         name: shortId
     *         required: true
     *         schema:
     *           type: string
     *       - in: query
     *         name: password
     *         schema:
     *           type: string
     *     responses:
     *       302:
     *         description: Redirect to original URL
     *       401:
     *         description: Password required or incorrect
     *       403:
     *         description: Security or Geo-restriction
     *       404:
     *         description: URL not found
     */
    async redirect(req, res) {
        const { shortId } = req.params;
        const { password } = req.query;
        const userCountry = req.headers['x-user-country']; // Simulation
        try {
            const result = await this.redirectURLUseCase.execute(shortId, userCountry);
            if (!result) {
                res.status(404).send('URL not found or expired');
                return;
            }
            if (result.password) {
                const isValid = await this.validatePasswordUseCase.execute(shortId, password);
                if (!isValid) {
                    res.status(401).json({ error: 'Password required or incorrect', passwordRequired: true });
                    return;
                }
            }
            res.redirect(302, result.longUrl);
        }
        catch (err) {
            if (err.message.includes('SECURITY_VIOLATION')) {
                res.status(403).json({ error: err.message });
                return;
            }
            if (err.message.includes('GEO_RESTRICTION')) {
                res.status(403).json({ error: err.message });
                return;
            }
            logger_1.default.error({ err, shortId }, '[URLController] Redirect failed');
            res.status(500).send('Internal Server Error');
        }
    }
}
exports.URLController = URLController;
