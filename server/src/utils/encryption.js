import crypto from 'crypto';
import config from '../config/index.js';
import logger from './logger.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a text string using AES-256-GCM.
 * @param {string} text - The text to encrypt.
 * @returns {string|null} - The encrypted text in the format: iv:salt:authTag:encryptedData, or null if text is missing or key is missing.
 */
export const encrypt = (text) => {
  if (!text) return null;
  if (!config.encryption.key) {
    logger.warn('Encryption key is missing. Storing plain text.');
    return text;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Derive key using pbkdf2
    const key = crypto.pbkdf2Sync(config.encryption.key, salt, 100000, 32, 'sha512');

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${salt.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Encryption error', { error: error.message });
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypts an encrypted text string.
 * @param {string} encryptedText - The text to decrypt.
 * @returns {string|null} - The decrypted plain text, or null if missing.
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  
  if (!encryptedText.includes(':')) {
    // Treat as plain text (e.g. if encryption was disabled or not applied)
    return encryptedText;
  }

  if (!config.encryption.key) {
    logger.error('Encryption key is missing. Cannot decrypt data.');
    throw new Error('Decryption failed due to missing key');
  }

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
        throw new Error('Invalid encrypted text format');
    }

    const [ivHex, saltHex, tagHex, encryptedDataHex] = parts;
    
    const iv = Buffer.from(ivHex, 'hex');
    const salt = Buffer.from(saltHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const key = crypto.pbkdf2Sync(config.encryption.key, salt, 100000, 32, 'sha512');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Decryption error', { error: error.message });
    throw new Error('Decryption failed');
  }
};
