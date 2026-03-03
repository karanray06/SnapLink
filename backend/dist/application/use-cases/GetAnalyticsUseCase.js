"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAnalyticsUseCase = void 0;
class GetAnalyticsUseCase {
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }
    async execute(shortId) {
        if (shortId) {
            return this.analyticsRepository.getStatsByShortId(shortId);
        }
        return this.analyticsRepository.getGlobalStats();
    }
}
exports.GetAnalyticsUseCase = GetAnalyticsUseCase;
