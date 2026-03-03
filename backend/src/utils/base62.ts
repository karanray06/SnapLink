const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function encode(num: number): string {
    let str = '';
    while (num > 0) {
        str = ALPHABET[num % 62] + str;
        num = Math.floor(num / 62);
    }
    return str.padStart(7, '0');
}

export function isValidShortId(id: string): boolean {
    const regex = /^[A-Za-z0-9\-_]{3,12}$/;
    return regex.test(id);
}
