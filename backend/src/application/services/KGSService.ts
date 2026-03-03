import redis from '../../db/redis';
import { encode } from '../../utils/base62';
import logger from '../../infrastructure/logging/logger';

export class KGSService {
    private currentCounter: number = 0;
    private maxCounter: number = 0;
    private readonly rangeSize: number = 1000;
    private readonly KGS_KEY = 'kgs:counter';

    constructor() { }

    /**
     * Initialize the KGS counter in Redis if it doesn't exist.
     */
    public async initCounter(): Promise<void> {
        const exists = await redis.exists(this.KGS_KEY);
        if (!exists) {
            await redis.set(this.KGS_KEY, '2000000'); // Starting from 2M as per previous fix
            logger.info('[KGS] Counter initialized at 2,000,000');
        }
    }

    /**
     * Initialize or fetch the next range from Redis.
     */
    private async fetchNextRange(): Promise<void> {
        try {
            const nextStart = await redis.incrby(this.KGS_KEY, this.rangeSize);
            this.currentCounter = nextStart - this.rangeSize;
            this.maxCounter = nextStart;
            logger.info(`[KGS] Fetched new range: ${this.currentCounter} - ${this.maxCounter}`);
        } catch (err) {
            logger.error({ err }, '[KGS] Failed to fetch next range from Redis');
            throw err;
        }
    }

    /**
     * Get a unique short ID. Fetches next range if depleted.
     */
    public async getNextShortId(): Promise<string> {
        if (this.currentCounter >= this.maxCounter) {
            await this.fetchNextRange();
        }

        const id = this.currentCounter++;
        return encode(id);
    }
}

export const kgsService = new KGSService();
