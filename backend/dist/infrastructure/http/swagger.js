"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SnapLink Enterprise API',
            version: '2.0.0',
            description: 'Hardcore Architect Version of SnapLink URL Shortener',
        },
        servers: [
            {
                url: process.env.BASE_URL || 'http://localhost',
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                },
            },
        },
    },
    apis: ['./src/presentation/controllers/*.ts', './src/presentation/routes.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
