// SideMind · API Key Verifier

import { type AiProvider } from '../ai/types';

export interface VerifyResult {
  valid: boolean;
  error?: string;
}

export async function verifyApiKey(provider: AiProvider, apiKey: string): Promise<VerifyResult> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { valid: false, error: 'API key is empty.' };
  }

  try {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cleanKey}`,
        },
      });

      if (res.ok) {
        return { valid: true };
      }
      const data = await res.json().catch(() => ({}));
      return {
        valid: false,
        error: data.error?.message || `OpenAI returned status ${res.status}`,
      };
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        method: 'GET',
        headers: {
          'x-api-key': cleanKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
      });

      if (res.ok) {
        return { valid: true };
      }
      const data = await res.json().catch(() => ({}));
      return {
        valid: false,
        error: data.error?.message || `Anthropic returned status ${res.status}`,
      };
    }

    if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`,
        { method: 'GET' }
      );

      if (res.ok) {
        return { valid: true };
      }
      const data = await res.json().catch(() => ({}));
      return {
        valid: false,
        error: data.error?.message || `Gemini returned status ${res.status}`,
      };
    }

    return { valid: false, error: `Unknown provider ${provider}` };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Network error occurred while testing API key.',
    };
  }
}
