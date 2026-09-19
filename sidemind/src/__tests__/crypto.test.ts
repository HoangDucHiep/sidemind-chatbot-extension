import { describe, it, expect } from 'vitest';
import { encryptText, decryptText } from '../lib/crypto';

describe('WebCrypto AES-GCM-256 Key Vault', () => {
  it('should encrypt and decrypt text correctly', async () => {
    const rawKey = 'sk-proj-1234567890abcdefABCDEF';
    const { ciphertext, iv, salt } = await encryptText(rawKey);

    expect(ciphertext).not.toBe(rawKey);
    expect(typeof ciphertext).toBe('string');
    expect(ciphertext.length).toBeGreaterThan(20);
    expect(iv.length).toBeGreaterThan(10);
    expect(salt.length).toBeGreaterThan(10);

    const decrypted = await decryptText(ciphertext, iv, salt);
    expect(decrypted).toBe(rawKey);
  });
});
