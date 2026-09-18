// SideMind · Google Gemini Streaming Adapter

import { type AiAdapter, type AiMessage, type AiProviderConfig } from './types';

export class GeminiAdapter implements AiAdapter {
  readonly provider = 'gemini' as const;

  async *stream(
    messages: AiMessage[],
    config: AiProviderConfig,
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    if (!config.apiKey) {
      throw new Error('MISSING_API_KEY: Google Gemini API key is not configured.');
    }

    const modelName = config.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      modelName
    )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(config.apiKey.trim())}`;

    // Separate system instruction
    const systemMessages = messages.filter((m) => m.role === 'system');
    const systemInstruction =
      systemMessages.length > 0
        ? {
            parts: [{ text: systemMessages.map((m) => m.content).join('\n\n') }],
          }
        : undefined;

    // Convert chat history to Gemini format (role: 'user' | 'model')
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction,
        generationConfig: {
          temperature: config.temperature ?? 0.7,
          maxOutputTokens: config.maxTokens ?? 2048,
        },
      }),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `Gemini API error (${response.status})`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error?.message) {
          errMsg = parsed.error.message;
        }
      } catch {
        if (errText) errMsg += `: ${errText}`;
      }
      throw new Error(errMsg);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            try {
              const data = JSON.parse(dataStr);
              const candidates = data.candidates;
              if (candidates && candidates.length > 0) {
                const parts = candidates[0]?.content?.parts;
                if (parts) {
                  for (const part of parts) {
                    if (part.text) {
                      yield part.text;
                    }
                  }
                }
              }
            } catch {
              // Ignore incomplete JSON chunks in SSE stream
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
