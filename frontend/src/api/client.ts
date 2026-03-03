import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export interface UrlItem {
    short_id: string;
    long_url: string;
    created_at: string;
    expires_at: string | null;
    click_count: string;
}

export interface AnalyticsData {
    shortId: string;
    longUrl: string;
    totalClicks: number;
    timeSeries: { date: string; clicks: number }[];
    browsers: { name: string; value: number }[];
    osList: { name: string; value: number }[];
    countries: { country: string; clicks: number }[];
    deviceTypes: { name: string; value: number }[];
    recentClicks: {
        ip_address: string;
        browser: string;
        os: string;
        device_type: string;
        country: string;
        clicked_at: string;
    }[];
}

export interface GlobalAnalytics {
    totalClicks: number;
    totalUrls: number;
    timeSeries: { date: string; clicks: number }[];
    browsers: { name: string; value: number }[];
    osList: { name: string; value: number }[];
    countries: { country: string; clicks: number }[];
    deviceTypes: { name: string; value: number }[];
    recentClicks: {
        ip_address: string;
        browser: string;
        os: string;
        device_type: string;
        country: string;
        clicked_at: string;
    }[];
}

export const fetchUrls = (limit = 20, offset = 0): Promise<{ urls: UrlItem[]; limit: number; offset: number }> =>
    api.get<{ urls: UrlItem[]; limit: number; offset: number }>(`/urls`, { params: { limit, offset } }).then(r => r.data);

export const fetchAnalytics = (shortId: string): Promise<AnalyticsData> =>
    api.get<AnalyticsData>(`/analytics/${shortId}`).then(r => r.data);

export const fetchGlobalAnalytics = (): Promise<GlobalAnalytics> =>
    api.get<GlobalAnalytics>(`/analytics`).then(r => r.data);

export const deleteUrl = (shortId: string): Promise<{ message: string }> =>
    api.delete<{ message: string }>(`/urls/${shortId}`).then(r => r.data);

export const shortenUrl = (data: { longUrl: string; customAlias?: string; expiresAt?: string }): Promise<any> =>
    api.post('/shorten', data).then(r => r.data);

export default api;
