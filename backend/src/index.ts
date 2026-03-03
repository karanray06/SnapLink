import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { runMigrations } from './db/postgres';
import { kgsService } from './application/services/KGSService';
import router, { urlController } from './presentation/routes';
import { requestLogger } from './presentation/middlewares/requestLogger';
import { swaggerSpec } from './infrastructure/http/swagger';
import logger from './infrastructure/logging/logger';
import { startAnalyticsWorker } from './workers/analyticsWorker';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'DELETE'],
}));
app.use(express.json());
app.use(requestLogger);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base Routes
app.use('/api', router);

// Catch-all for redirects (Legacy Support / Main Entry)
app.get('/:shortId', (req, res) => urlController.redirect(req, res));

async function start(): Promise<void> {
    try {
        logger.info('[App] 🛡️ Starting SnapLink Enterprise...');

        logger.info('[App] Running database migrations...');
        await runMigrations();

        logger.info('[App] Initializing KGS counter...');
        await kgsService.initCounter();

        logger.info('[Worker] Starting background analytics processor...');
        startAnalyticsWorker();

        app.listen(PORT, () => {
            logger.info({ port: PORT, env: process.env.NODE_ENV }, `[App] 🚀 Server running on port ${PORT}`);
            logger.info(`[App] 📝 Documentation available at http://localhost:${PORT}/api-docs`);
        });
    } catch (err) {
        logger.error({ err }, '[App] Startup failed:');
        process.exit(1);
    }
}

// Graceful Shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    // Add cleanup logic here (close DB pools, etc.)
    process.exit(0);
});

start();

export default app;
