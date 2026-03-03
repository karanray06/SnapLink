import { Request, Response, NextFunction } from 'express';
import { IAPIKeyRepository } from '../../domain/repositories/IAPIKeyRepository';
import logger from '../../infrastructure/logging/logger';
import * as crypto from 'crypto';

export function apiKeyValidator(apiKeyRepository: IAPIKeyRepository) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            return res.status(401).json({ error: 'API Key is missing' });
        }

        try {
            // In a real system, we'd hash the provided key
            const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
            const keyData = await apiKeyRepository.findByHash(keyHash);

            if (!keyData) {
                return res.status(401).json({ error: 'Invalid API Key' });
            }

            if (keyData.usageCount >= keyData.usageQuota) {
                return res.status(429).json({ error: 'API Key quota exceeded' });
            }

            // Background increment usage (could be async or handled via a queue)
            apiKeyRepository.incrementUsage(keyData.id!).catch(err =>
                logger.error({ err, keyId: keyData.id }, 'Failed to increment API key usage')
            );

            // Store key info for downstream use
            (req as any).apiKey = keyData;
            next();
        } catch (err: any) {
            logger.error({ err }, 'API Key validation failed');
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}
