// SideMind · Anthropic Claude Streaming Adapter

import { type AiAdapter, type AiMessage, type AiProviderConfig } from './types';

export class AnthropicAdapter implements AiAdapter {
  readonly provider = 'anthropic' as const;

  async *stream(
    messages: AiMessage[],
    config: AiProviderConfig,
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    if (!config.apiKey) {
      throw new Error('MISSING_API_KEY: Anthropic API key is not configured.');
    }

    // Separate system prompt from conversation messages
    const systemMessages = messages.filter((m) => m.role === 'system');
    const systemPrompt = systemMessages.map((m) => m.content).join('\n\n');
    const nonSystemMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }));

    // Ensure first message is user
    if (nonSystemMessages.length === 0 || nonSystemMessages[0].role !== 'user') {
      nonSystemMessages.unshift({ role: 'user', content: 'Hello' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-5-haiku-20241022',
        system: systemPrompt || undefined,
        messages: nonSystemMessages,
        max_tokens: config.maxTokens ?? 2048,
        temperature: config.temperature ?? 0.7,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `Anthropic API error (${response.status})`;
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
              if (
                data.type === 'content_block_delta' &&
                data.delta?.type === 'text_delta' &&
                data.delta?.text
              ) {
                yield data.delta.text;
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
