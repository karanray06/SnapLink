export interface ClickAnalytics {
    id?: number;
    shortId: string;
    ipAddress: string;
    userAgent: string;
    referrer: string | null;
    browser: string;
    os: string;
    deviceType: string;
    country: string | null;
    clickedAt: Date;
}
