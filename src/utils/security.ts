import { AES, enc } from 'crypto-js';

export const encryptData = (data: string, key: string): string => {
    return AES.encrypt(data, key).toString();
};

export const decryptData = (ciphertext: string, key: string): string => {
    const bytes = AES.decrypt(ciphertext, key);
    return bytes.toString(enc.Utf8);
};

export const generateCSP = (): string => {
    return `
    default-src 'self';
    script-src 'self' https://checkout.razorpay.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://firestore.googleapis.com https://api.razorpay.com;
  `.replace(/\s+/g, ' ').trim();
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
};
