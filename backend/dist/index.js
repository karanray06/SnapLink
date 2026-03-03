"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const postgres_1 = require("./db/postgres");
const KGSService_1 = require("./application/services/KGSService");
const routes_1 = __importStar(require("./presentation/routes"));
const requestLogger_1 = require("./presentation/middlewares/requestLogger");
const swagger_1 = require("./infrastructure/http/swagger");
const logger_1 = __importDefault(require("./infrastructure/logging/logger"));
const analyticsWorker_1 = require("./workers/analyticsWorker");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'DELETE'],
}));
app.use(express_1.default.json());
app.use(requestLogger_1.requestLogger);
// API Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Base Routes
app.use('/api', routes_1.default);
// Catch-all for redirects (Legacy Support / Main Entry)
app.get('/:shortId', (req, res) => routes_1.urlController.redirect(req, res));
async function start() {
    try {
        logger_1.default.info('[App] 🛡️ Starting SnapLink Enterprise...');
        logger_1.default.info('[App] Running database migrations...');
        await (0, postgres_1.runMigrations)();
        logger_1.default.info('[App] Initializing KGS counter...');
        await KGSService_1.kgsService.initCounter();
        logger_1.default.info('[Worker] Starting background analytics processor...');
        (0, analyticsWorker_1.startAnalyticsWorker)();
        app.listen(PORT, () => {
            logger_1.default.info({ port: PORT, env: process.env.NODE_ENV }, `[App] 🚀 Server running on port ${PORT}`);
            logger_1.default.info(`[App] 📝 Documentation available at http://localhost:${PORT}/api-docs`);
        });
    }
    catch (err) {
        logger_1.default.error({ err }, '[App] Startup failed:');
        process.exit(1);
    }
}
// Graceful Shutdown
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received. Shutting down gracefully...');
    // Add cleanup logic here (close DB pools, etc.)
    process.exit(0);
});
start();
exports.default = app;
