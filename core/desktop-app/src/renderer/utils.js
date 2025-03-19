import { decryptData } from './shared/encryption';

/**
 * Helper function for content preview
 * @param {Object} item - The clipboard item
 * @param {string} key - The encryption key
 * @returns {string} Content preview
 */
export const getContentPreview = (item, key) => {
    try {
        if (item.content_type === 'file') {
            const decrypted = JSON.parse(decryptData(item.content, key));
            return `File: ${decrypted.name || 'Unknown'}`;
        } else {
            const decrypted = decryptData(item.content, key);
            return typeof decrypted === 'string' ? decrypted.substring(0, 150) : String(decrypted);
        }
    } catch (err) {
        console.error('Error decrypting content:', err);
        return '[Encrypted Content]';
    }
};
