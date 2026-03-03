import { IURLRepository } from '../../domain/repositories/IURLRepository';
import * as bcrypt from 'bcrypt';

export class ValidatePasswordUseCase {
    constructor(private urlRepository: IURLRepository) { }

    async execute(shortId: string, password?: string): Promise<boolean> {
        const urlMapping = await this.urlRepository.findByShortId(shortId);

        if (!urlMapping || !urlMapping.password) {
            return true; // No password required or URL doesn't exist (handle 404 in controller)
        }

        if (!password) {
            return false;
        }

        return await bcrypt.compare(password, urlMapping.password);
    }
}
