"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoring = void 0;
const prom_client_1 = require("prom-client");
class MonitoringService {
    constructor() {
        this.registry = new prom_client_1.Registry();
        this.registry.setDefaultLabels({
            app: 'snaplink-enterprise',
        });
        (0, prom_client_1.collectDefaultMetrics)({ register: this.registry });
        this.httpRequestsTotal = new prom_client_1.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status'],
            registers: [this.registry],
        });
        this.httpRequestDurationSeconds = new prom_client_1.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status'],
            registers: [this.registry],
        });
    }
    async getMetrics() {
        return this.registry.metrics();
    }
    get contentType() {
        return this.registry.contentType;
    }
}
exports.monitoring = new MonitoringService();
