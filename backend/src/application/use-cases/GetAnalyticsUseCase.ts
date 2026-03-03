import { IAnalyticsRepository } from '../../domain/repositories/IAnalyticsRepository';

export class GetAnalyticsUseCase {
    constructor(private analyticsRepository: IAnalyticsRepository) { }

    async execute(shortId?: string): Promise<any> {
        if (shortId) {
            return this.analyticsRepository.getStatsByShortId(shortId);
        }
        return this.analyticsRepository.getGlobalStats();
    }
}
