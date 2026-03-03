import { URLMapping } from '../entities/URLMapping';

export interface IURLRepository {
    findByShortId(shortId: string): Promise<URLMapping | null>;
    save(url: URLMapping): Promise<void>;
    update(url: URLMapping): Promise<void>;
    delete(shortId: string): Promise<void>;
    findAll(limit: number, offset: number): Promise<URLMapping[]>;
    countAll(): Promise<number>;
}
