import { IURLRepository } from '../../domain/repositories/IURLRepository';
import { URLMapping } from '../../domain/entities/URLMapping';
import * as bcrypt from 'bcrypt';

export interface ShortenURLRequest {
    longUrl: string;
    customAlias?: string;
    expiresAt?: Date;
    password?: string;
}

export class ShortenURLUseCase {
    constructor(
        private urlRepository: IURLRepository,
        private generateShortId: () => Promise<string>
    ) { }

    async execute(request: ShortenURLRequest): Promise<URLMapping> {
        let shortId: string;

        if (request.customAlias) {
            const existing = await this.urlRepository.findByShortId(request.customAlias);
            if (existing) {
                throw new Error('Custom alias already exists');
            }
            shortId = request.customAlias;
        } else {
            shortId = await this.generateShortId();
        }

        let hashedPassword = undefined;
        if (request.password) {
            hashedPassword = await bcrypt.hash(request.password, 10);
        }

        const urlMapping: URLMapping = {
            shortId,
            longUrl: request.longUrl,
            customAlias: !!request.customAlias,
            isActive: true,
            createdAt: new Date(),
            expiresAt: request.expiresAt || null,
            password: hashedPassword,
        };

        await this.urlRepository.save(urlMapping);
        return urlMapping;
    }
}
