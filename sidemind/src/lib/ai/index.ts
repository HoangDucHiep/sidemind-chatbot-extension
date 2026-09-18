// SideMind · AI Adapter Factory & Unified Streamer

import { type AiAdapter, type AiMessage, type AiProvider, type AiProviderConfig } from './types';
import { OpenAiAdapter } from './openai';
import { AnthropicAdapter } from './anthropic';
import { GeminiAdapter } from './gemini';

const adapters: Record<AiProvider, AiAdapter> = {
  openai: new OpenAiAdapter(),
  anthropic: new AnthropicAdapter(),
  gemini: new GeminiAdapter(),
};

export function getAiAdapter(provider: AiProvider): AiAdapter {
  const adapter = adapters[provider];
  if (!adapter) {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
  return adapter;
}

export async function* streamChat(
  provider: AiProvider,
  messages: AiMessage[],
  config: AiProviderConfig,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const adapter = getAiAdapter(provider);
  yield* adapter.stream(messages, config, signal);
}

export * from './types';
export * from './openai';
export * from './anthropic';
export * from './gemini';
