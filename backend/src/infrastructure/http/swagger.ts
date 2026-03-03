import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
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

export const swaggerSpec = swaggerJSDoc(options);
