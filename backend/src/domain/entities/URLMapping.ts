export interface URLMapping {
    id?: number;
    shortId: string;
    longUrl: string;
    customAlias: boolean;
    isActive: boolean;
    createdAt: Date;
    expiresAt: Date | null;
    password?: string; // New: for password protection
}
