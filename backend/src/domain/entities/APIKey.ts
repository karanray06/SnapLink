export interface APIKey {
    id?: number;
    keyHash: string;
    ownerName: string;
    isActive: boolean;
    usageQuota: number;
    usageCount: number;
    createdAt: Date;
    lastUsedAt: Date | null;
}
