import { IURLRepository } from '../../domain/repositories/IURLRepository';
import { URLMapping } from '../../domain/entities/URLMapping';

const MALWARE_BLACKLIST = [
    'malware.com',
    'phishing-site.net',
    'evil-shortener.io'
];

export class RedirectURLUseCase {
    constructor(private urlRepository: IURLRepository) { }

    async execute(shortId: string, userCountry?: string): Promise<URLMapping | null> {
        const urlMapping = await this.urlRepository.findByShortId(shortId);

        if (!urlMapping || !urlMapping.isActive) {
            return null;
        }

        if (urlMapping.expiresAt && urlMapping.expiresAt < new Date()) {
            urlMapping.isActive = false;
            await this.urlRepository.update(urlMapping);
            return null;
        }

        // Safe Browsing Simulation
        const isBlacklisted = MALWARE_BLACKLIST.some(domain => urlMapping.longUrl.includes(domain));
        if (isBlacklisted) {
            throw new Error('SECURITY_VIOLATION: Destination URL is blacklisted');
        }

        // Geo-fencing Simulation (Hypothetical: if the mapping had an 'allowedCountries' field)
        // For now, let's assume a static list or a mock check
        const blockedCountries = ['CN', 'KP']; // Example: block access from specific regions
        if (userCountry && blockedCountries.includes(userCountry)) {
            throw new Error('GEO_RESTRICTION: Access not allowed from your region');
        }

        return urlMapping;
    }
}
