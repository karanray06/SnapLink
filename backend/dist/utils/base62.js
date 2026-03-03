"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = encode;
exports.isValidShortId = isValidShortId;
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
function encode(num) {
    let str = '';
    while (num > 0) {
        str = ALPHABET[num % 62] + str;
        num = Math.floor(num / 62);
    }
    return str.padStart(7, '0');
}
function isValidShortId(id) {
    const regex = /^[A-Za-z0-9\-_]{3,12}$/;
    return regex.test(id);
}
