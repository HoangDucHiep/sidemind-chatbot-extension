// SideMind · Chat State Store (Zustand)

import { create } from 'zustand';
import { type AiProvider, streamChat, DEFAULT_MODELS } from '../lib/ai';
import { buildSystemPrompt } from '../lib/context/prompts';
import { storage } from '../lib/storage';
import { useContextStore } from './useContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  error?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  activeProvider: AiProvider;
  activeModel: string;
  abortController: AbortController | null;

  setProvider: (provider: AiProvider) => void;
  setModel: (model: string) => void;
  sendMessage: (prompt: string) => Promise<void>;
  stopStreaming: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  activeProvider: 'gemini',
  activeModel: DEFAULT_MODELS.gemini,
  abortController: null,

  setProvider: (provider: AiProvider) => {
    const defaultModel = DEFAULT_MODELS[provider];
    set({ activeProvider: provider, activeModel: defaultModel });
    storage.set('sidemind_active_provider', provider);
    storage.set('sidemind_active_model', defaultModel);
  },

  setModel: (model: string) => {
    set({ activeModel: model });
    storage.set('sidemind_active_model', model);
  },

  sendMessage: async (userPrompt: string) => {
    const trimmed = userPrompt.trim();
    if (!trimmed || get().isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg, assistantMsg],
      isStreaming: true,
    }));

    const abortController = new AbortController();
    set({ abortController });

    const { activeProvider, activeModel, messages } = get();
    const context = useContextStore.getState().context;
    const systemPrompt = buildSystemPrompt(context || undefined);

    // Retrieve API key for active provider
    let apiKey = '';
    const savedKeys = await storage.get('sidemind_keys_encrypted');
    if (savedKeys && savedKeys[activeProvider]) {
      apiKey = savedKeys[activeProvider]!;
    }

    // Build payload messages
    const payload = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: trimmed },
    ];

    try {
      if (!apiKey) {
        throw new Error(
          `MISSING_KEY: Please enter your ${activeProvider.toUpperCase()} API key in Settings (⚙️) to start chatting.`
        );
      }

      const stream = streamChat(
        activeProvider,
        payload,
        {
          apiKey,
          model: activeModel,
        },
        abortController.signal
      );

      let accumulated = '';
      for await (const chunk of stream) {
        accumulated += chunk;
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantMsgId ? { ...m, content: accumulated } : m
          ),
        }));
      }

      set({ isStreaming: false, abortController: null });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User stopped manually
        set({ isStreaming: false, abortController: null });
        return;
      }

      const errorMessage = err instanceof Error ? err.message : String(err);
      set((state) => ({
        isStreaming: false,
        abortController: null,
        messages: state.messages.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  m.content ||
                  `⚠️ Error: ${errorMessage}`,
                error: errorMessage,
              }
            : m
        ),
      }));
    }
  },

  stopStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ isStreaming: false, abortController: null });
    }
  },

  clearChat: () => {
    get().stopStreaming();
    set({ messages: [] });
  },
}));
