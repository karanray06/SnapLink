import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

class MonitoringService {
    private registry: Registry;
    public httpRequestsTotal: Counter<string>;
    public httpRequestDurationSeconds: Histogram<string>;

    constructor() {
        this.registry = new Registry();
        this.registry.setDefaultLabels({
            app: 'snaplink-enterprise',
        });

        collectDefaultMetrics({ register: this.registry });

        this.httpRequestsTotal = new Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status'],
            registers: [this.registry],
        });

        this.httpRequestDurationSeconds = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status'],
            registers: [this.registry],
        });
    }

    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }

    get contentType(): string {
        return this.registry.contentType;
    }
}

export const monitoring = new MonitoringService();
