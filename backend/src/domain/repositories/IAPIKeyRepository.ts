import { APIKey } from '../entities/APIKey';

export interface IAPIKeyRepository {
    findByHash(keyHash: string): Promise<APIKey | null>;
    incrementUsage(id: number): Promise<void>;
    save(apiKey: APIKey): Promise<void>;
}
