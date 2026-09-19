// SideMind · WebCrypto AES-GCM-256 Encryption for API Keys
// Keys are encrypted client-side before storage in chrome.storage.local

import { storage } from './storage';
import { type AiProvider } from './ai/types';

// Helper: convert buffer to hex string and vice versa
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Generate or retrieve persistent local seed
async function getOrCreateDeviceSalt(): Promise<Uint8Array> {
  const saved = await storage.get('sidemind_keys_encrypted');
  if (saved?.salt) {
    return hexToBuffer(saved.salt);
  }
  const newSalt = crypto.getRandomValues(new Uint8Array(16));
  return newSalt;
}

// Derive a 256-bit AES-GCM key from device-unique material using PBKDF2
async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  // Use extension id and navigator userAgent as local entropy base
  const entropy = (typeof chrome !== 'undefined' ? chrome.runtime?.id : '') + '-sidemind-client-secret';
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(entropy),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(plaintext: string): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const salt = await getOrCreateDeviceSalt();
  const key = await deriveKey(salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: bufferToHex(encrypted),
    iv: bufferToHex(iv.buffer as ArrayBuffer),
    salt: bufferToHex(salt.buffer as ArrayBuffer),
  };
}

export async function decryptText(ciphertextHex: string, ivHex: string, saltHex: string): Promise<string> {
  const salt = hexToBuffer(saltHex);
  const iv = hexToBuffer(ivHex);
  const key = await deriveKey(salt);
  const ciphertext = hexToBuffer(ciphertextHex);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Storage helpers for API Keys
export async function saveApiKey(provider: AiProvider, rawApiKey: string): Promise<void> {
  const current = (await storage.get('sidemind_keys_encrypted')) || {};
  if (!rawApiKey.trim()) {
    delete current[provider];
    await storage.set('sidemind_keys_encrypted', current);
    return;
  }

  const { ciphertext, iv, salt } = await encryptText(rawApiKey.trim());
  current[provider] = `${ciphertext}:${iv}`;
  current.salt = salt;
  await storage.set('sidemind_keys_encrypted', current);
}

export async function getDecryptedApiKey(provider: AiProvider): Promise<string> {
  const current = await storage.get('sidemind_keys_encrypted');
  if (!current || !current[provider] || !current.salt) {
    return '';
  }

  const parts = current[provider]!.split(':');
  if (parts.length !== 2) return '';

  const [ciphertext, iv] = parts;
  try {
    return await decryptText(ciphertext, iv, current.salt);
  } catch (err) {
    console.warn('[SideMind] Failed to decrypt API key for', provider, err);
    return '';
  }
}

export async function hasApiKey(provider: AiProvider): Promise<boolean> {
  const key = await getDecryptedApiKey(provider);
  return Boolean(key);
}
