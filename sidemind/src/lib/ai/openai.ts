// SideMind · OpenAI Streaming Adapter

import { type AiAdapter, type AiMessage, type AiProviderConfig } from './types';

export class OpenAiAdapter implements AiAdapter {
  readonly provider = 'openai' as const;

  async *stream(
    messages: AiMessage[],
    config: AiProviderConfig,
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    if (!config.apiKey) {
      throw new Error('MISSING_API_KEY: OpenAI API key is not configured.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2048,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `OpenAI API error (${response.status})`;
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
          if (trimmed === 'data: [DONE]') return;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            try {
              const data = JSON.parse(dataStr);
              const text = data.choices?.[0]?.delta?.content;
              if (text) {
                yield text;
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
