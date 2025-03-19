// Placeholder for encryption.js

const CryptoJS = require('crypto-js');

/**
 * Encrypts data using AES-256 encryption
 * @param {string|object} data - The data to encrypt
 * @param {string} key - The encryption key
 * @returns {string} The encrypted data as a string
 */
function encryptData(data, key) {
    // Convert objects to strings if necessary
    const dataString = typeof data === 'object' ? JSON.stringify(data) : data;

    // Encrypt using AES
    const encrypted = CryptoJS.AES.encrypt(dataString, key).toString();

    return encrypted;
}

/**
 * Decrypts data using AES-256 encryption
 * @param {string} encryptedData - The encrypted data string
 * @param {string} key - The encryption key
 * @returns {string} The decrypted data
 */
function decryptData(encryptedData, key) {
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);

    // Convert to string
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    // Try parsing as JSON if it looks like JSON
    try {
        if (decryptedString.startsWith('{') || decryptedString.startsWith('[')) {
            return JSON.parse(decryptedString);
        }
    } catch (e) {
        // Not valid JSON, return as string
    }

    return decryptedString;
}

/**
 * Generates a secure random encryption key
 * @returns {string} A random encryption key
 */
function generateEncryptionKey() {
    // Generate random bytes
    const randomBytes = CryptoJS.lib.WordArray.random(32); // 256 bits

    // Convert to hex string
    return randomBytes.toString(CryptoJS.enc.Hex);
}

module.exports = {
    encryptData,
    decryptData,
    generateEncryptionKey
};