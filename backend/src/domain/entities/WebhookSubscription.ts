export interface WebhookSubscription {
    id?: number;
    ownerName: string;
    targetUrl: string;
    eventType: string;
    isActive: boolean;
    secret?: string;
}
