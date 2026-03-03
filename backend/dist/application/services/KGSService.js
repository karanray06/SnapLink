"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kgsService = exports.KGSService = void 0;
const redis_1 = __importDefault(require("../../db/redis"));
const base62_1 = require("../../utils/base62");
const logger_1 = __importDefault(require("../../infrastructure/logging/logger"));
class KGSService {
    constructor() {
        this.currentCounter = 0;
        this.maxCounter = 0;
        this.rangeSize = 1000;
        this.KGS_KEY = 'kgs:counter';
    }
    /**
     * Initialize the KGS counter in Redis if it doesn't exist.
     */
    async initCounter() {
        const exists = await redis_1.default.exists(this.KGS_KEY);
        if (!exists) {
            await redis_1.default.set(this.KGS_KEY, '2000000'); // Starting from 2M as per previous fix
            logger_1.default.info('[KGS] Counter initialized at 2,000,000');
        }
    }
    /**
     * Initialize or fetch the next range from Redis.
     */
    async fetchNextRange() {
        try {
            const nextStart = await redis_1.default.incrby(this.KGS_KEY, this.rangeSize);
            this.currentCounter = nextStart - this.rangeSize;
            this.maxCounter = nextStart;
            logger_1.default.info(`[KGS] Fetched new range: ${this.currentCounter} - ${this.maxCounter}`);
        }
        catch (err) {
            logger_1.default.error({ err }, '[KGS] Failed to fetch next range from Redis');
            throw err;
        }
    }
    /**
     * Get a unique short ID. Fetches next range if depleted.
     */
    async getNextShortId() {
        if (this.currentCounter >= this.maxCounter) {
            await this.fetchNextRange();
        }
        const id = this.currentCounter++;
        return (0, base62_1.encode)(id);
    }
}
exports.KGSService = KGSService;
exports.kgsService = new KGSService();
