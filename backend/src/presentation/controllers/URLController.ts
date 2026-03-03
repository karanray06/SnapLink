import { Request, Response } from 'express';
import { ShortenURLUseCase } from '../../application/use-cases/ShortenURLUseCase';
import { RedirectURLUseCase } from '../../application/use-cases/RedirectURLUseCase';
import { ValidatePasswordUseCase } from '../../application/use-cases/ValidatePasswordUseCase';
import logger from '../../infrastructure/logging/logger';
import { monitoring } from '../../infrastructure/monitoring/MonitoringService';

/**
 * @swagger
 * tags:
 *   name: URLs
 *   description: URL Management and Redirection
 */
export class URLController {
    constructor(
        private shortenURLUseCase: ShortenURLUseCase,
        private redirectURLUseCase: RedirectURLUseCase,
        private validatePasswordUseCase: ValidatePasswordUseCase
    ) { }

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
    async shorten(req: Request, res: Response): Promise<void> {
        const startTime = Date.now();
        try {
            const { longUrl, customAlias, expiresAt, password } = req.body;

            const result = await this.shortenURLUseCase.execute({
                longUrl,
                customAlias,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                password
            });

            monitoring.httpRequestsTotal.inc({ method: 'POST', route: '/api/shorten', status: '201' });
            monitoring.httpRequestDurationSeconds.observe({ method: 'POST', route: '/api/shorten', status: '201' }, (Date.now() - startTime) / 1000);

            res.status(201).json({
                shortId: result.shortId,
                shortUrl: `${process.env.BASE_URL}/${result.shortId}`,
                longUrl: result.longUrl,
                expiresAt: result.expiresAt,
                createdAt: result.createdAt,
            });
        } catch (err: any) {
            logger.error({ err }, '[URLController] Shorten failed');
            monitoring.httpRequestsTotal.inc({ method: 'POST', route: '/api/shorten', status: '400' });
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
    async redirect(req: Request, res: Response): Promise<void> {
        const { shortId } = req.params;
        const { password } = req.query;
        const userCountry = req.headers['x-user-country'] as string; // Simulation

        try {
            const result = await this.redirectURLUseCase.execute(shortId as string, userCountry);

            if (!result) {
                res.status(404).send('URL not found or expired');
                return;
            }

            if (result.password) {
                const isValid = await this.validatePasswordUseCase.execute(shortId as string, password as string);
                if (!isValid) {
                    res.status(401).json({ error: 'Password required or incorrect', passwordRequired: true });
                    return;
                }
            }

            res.redirect(302, result.longUrl);
        } catch (err: any) {
            if (err.message.includes('SECURITY_VIOLATION')) {
                res.status(403).json({ error: err.message });
                return;
            }
            if (err.message.includes('GEO_RESTRICTION')) {
                res.status(403).json({ error: err.message });
                return;
            }
            logger.error({ err, shortId }, '[URLController] Redirect failed');
            res.status(500).send('Internal Server Error');
        }
    }
}
