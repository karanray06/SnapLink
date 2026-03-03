"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyValidator = apiKeyValidator;
const logger_1 = __importDefault(require("../../infrastructure/logging/logger"));
const crypto = __importStar(require("crypto"));
function apiKeyValidator(apiKeyRepository) {
    return async (req, res, next) => {
        const apiKey = req.headers['x-api-key'];
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
            apiKeyRepository.incrementUsage(keyData.id).catch(err => logger_1.default.error({ err, keyId: keyData.id }, 'Failed to increment API key usage'));
            // Store key info for downstream use
            req.apiKey = keyData;
            next();
        }
        catch (err) {
            logger_1.default.error({ err }, 'API Key validation failed');
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}
