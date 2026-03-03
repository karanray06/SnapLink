import { ClickAnalytics } from '../entities/ClickAnalytics';

export interface IAnalyticsRepository {
    save(event: ClickAnalytics): Promise<void>;
    getGlobalStats(): Promise<any>;
    getStatsByShortId(shortId: string): Promise<any>;
}
