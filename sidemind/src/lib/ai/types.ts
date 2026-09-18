// SideMind · AI Types and Adapter Interface

export type AiProvider = 'openai' | 'anthropic' | 'gemini';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiProviderConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiAdapter {
  readonly provider: AiProvider;
  stream(
    messages: AiMessage[],
    config: AiProviderConfig,
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown>;
}

export const DEFAULT_MODELS: Record<AiProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-20241022',
  gemini: 'gemini-1.5-flash',
};

export const AVAILABLE_MODELS: Record<AiProvider, Array<{ id: string; label: string }>> = {
  openai: [
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cheap)' },
    { id: 'gpt-4o', label: 'GPT-4o (High Intelligence)' },
  ],
  anthropic: [
    { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Fast & Long Output)' },
    { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Best Reasoning)' },
  ],
  gemini: [
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Generous Free Tier)' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Large Context Window)' },
  ],
};
