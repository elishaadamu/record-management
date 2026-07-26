import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'ops-portal-secret-key-12345!';

/**
 * Encrypts any data payload into an AES encrypted string.
 * @param data The data (object, string, etc.) to encrypt
 */
export const encryptData = (data: any): string => {
  if (data === null || data === undefined) return '';
  const stringifiedData = typeof data === 'object' ? JSON.stringify(data) : String(data);
  return CryptoJS.AES.encrypt(stringifiedData, SECRET_KEY).toString();
};

/**
 * Decrypts an AES encrypted string back to its original value/object.
 * @param ciphertext The encrypted string
 */
export const decryptData = (ciphertext: string | null): any => {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) return null;
    
    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (error) {
    return null;
  }
};
