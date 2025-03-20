import CryptoJS from 'crypto-js';

export class Encryption {
  private static readonly KEY_SIZE = 256 / 32; // 256 bits in words
  private static readonly ITERATION_COUNT = 10000;

  /**
   * Generates a secure encryption key from a password and salt
   */
  static generateKey(password: string, salt: string): string {
    return CryptoJS.PBKDF2(
      password,
      salt,
      {
        keySize: this.KEY_SIZE,
        iterations: this.ITERATION_COUNT
      }
    ).toString();
  }

  /**
   * Encrypts data with AES-256
   */
  static encrypt(data: string, key: string): string {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    // Combine IV and encrypted data for transmission
    const result = iv.toString() + encrypted.toString();
    return result;
  }

  /**
   * Decrypts AES-256 encrypted data
   */
  static decrypt(encryptedData: string, key: string): string {
    try {
      // Extract IV (first 32 chars in hex = 16 bytes)
      const ivHex = encryptedData.slice(0, 32);
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      
      // Get actual encrypted data excluding IV
      const encrypted = encryptedData.slice(32);
      
      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error("Decryption failed:", e);
      throw new Error("Failed to decrypt data");
    }
  }
}
