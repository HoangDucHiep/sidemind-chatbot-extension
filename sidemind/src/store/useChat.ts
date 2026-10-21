// SideMind · Chat State Store (Zustand)
// Enhanced with 3-Tier Memory Architecture & Session Dreaming (Phase 2)

import { create } from "zustand";
import { type AiProvider, streamChat, DEFAULT_MODELS } from "../lib/ai";
import { buildSystemPrompt } from "../lib/context/prompts";
import {
  assembleThreeTierPayload,
  splitMemoryTiers,
  summarizeSessionHistory,
  shouldTriggerSessionDreaming,
} from "../lib/context/memory";
import { storage } from "../lib/storage";
import { getDecryptedApiKey } from "../lib/crypto";
import { historyService } from "../lib/history";
import { useContextStore } from "./useContext";
import { useMultiTabStore } from "./useMultiTab";
import { type FileAttachment } from "../lib/file-extractor";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  error?: string;
  attachments?: FileAttachment[];
}

interface ChatState {
  messages: ChatMessage[];
  summaryState: string;
  isStreaming: boolean;
  isSummarizingMemory: boolean;
  activeProvider: AiProvider;
  activeModel: string;
  abortController: AbortController | null;

  setProvider: (provider: AiProvider) => void;
  setModel: (model: string) => void;
  setSummaryState: (summary: string) => void;
  sendMessage: (
    prompt: string,
    attachments?: FileAttachment[],
  ) => Promise<void>;
  triggerSessionDreaming: () => Promise<void>;
  stopStreaming: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  summaryState: "",
  isStreaming: false,
  isSummarizingMemory: false,
  activeProvider: "gemini",
  activeModel: DEFAULT_MODELS.gemini,
  abortController: null,

  setProvider: (provider: AiProvider) => {
    const defaultModel = DEFAULT_MODELS[provider];
    set({ activeProvider: provider, activeModel: defaultModel });
    storage.set("sidemind_active_provider", provider);
    storage.set("sidemind_active_model", defaultModel);
  },

  setModel: (model: string) => {
    set({ activeModel: model });
    storage.set("sidemind_active_model", model);
  },

  setSummaryState: (summary: string) => {
    set({ summaryState: summary });
  },

  sendMessage: async (userPrompt: string, attachments?: FileAttachment[]) => {
    const trimmed = userPrompt.trim();
    if (
      (!trimmed && (!attachments || attachments.length === 0)) ||
      get().isStreaming
    )
      return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
      attachments,
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    const previousMessages = get().messages;

    set((state) => ({
      messages: [...state.messages, userMsg, assistantMsg],
      isStreaming: true,
    }));

    const abortController = new AbortController();
    set({ abortController });

    const { activeProvider, activeModel, summaryState } = get();
    const context = useContextStore.getState().context;
    const extraTabs = useMultiTabStore
      .getState()
      .sources.filter((s) => s.status === "ready");

    // Retrieve custom persona and build dynamic budget system prompt
    const userPersona = await storage.get("sidemind_user_persona");
    const systemPrompt = buildSystemPrompt(
      context || undefined,
      extraTabs,
      userPersona,
      activeModel,
      attachments,
      trimmed,
    );

    // Retrieve decrypted API key for active provider
    const apiKey = await getDecryptedApiKey(activeProvider);
    const temperature = (await storage.get("sidemind_temperature")) ?? 0.7;
    const maxTokens = (await storage.get("sidemind_max_tokens")) ?? 2048;

    // Assemble 3-Tier Memory payload:
    // Tier 3: System Prompt (Context + Tabs + Persona)
    // Tier 2: Summary State (Condensed previous memory)
    // Tier 1: Working Memory (Up to 4 recent messages + new user message)
    const payload = assembleThreeTierPayload({
      systemPrompt,
      summaryState,
      previousMessages,
      newPrompt: trimmed,
      attachments,
      workingMemoryCount: 4,
    });

    try {
      if (!apiKey) {
        throw new Error(
          `MISSING_KEY: Please enter your ${activeProvider.toUpperCase()} API key in Settings (⚙️) to start chatting.`,
        );
      }

      const stream = streamChat(
        activeProvider,
        payload,
        {
          apiKey,
          model: activeModel,
          temperature,
          maxTokens,
        },
        abortController.signal,
      );

      let accumulated = "";
      for await (const chunk of stream) {
        accumulated += chunk;
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantMsgId ? { ...m, content: accumulated } : m,
          ),
        }));
      }

      set({ isStreaming: false, abortController: null });

      // Save updated conversation to history (including summaryState)
      const currentMessages = get().messages;
      const currentSummary = get().summaryState;
      const firstUserMsg =
        currentMessages.find((m) => m.role === "user")?.content ||
        "Conversation";
      const title =
        firstUserMsg.slice(0, 32) + (firstUserMsg.length > 32 ? "…" : "");

      historyService.save({
        id: currentMessages[0]?.id || `convo-${Date.now()}`,
        title,
        timestamp: Date.now(),
        model: activeModel,
        provider: activeProvider,
        pageUrl: context?.url,
        pageType: context?.pageType,
        tags: [context?.pageType || "general", activeProvider],
        messageCount: currentMessages.length,
        summaryState: currentSummary,
        messages: currentMessages,
      });

      // Trigger background Session Dreaming if threshold reached
      if (
        shouldTriggerSessionDreaming(currentMessages.length) &&
        !get().isSummarizingMemory
      ) {
        // Run in background without awaiting so user can interact immediately
        get().triggerSessionDreaming();
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
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
                content: m.content || `⚠️ Error: ${errorMessage}`,
                error: errorMessage,
              }
            : m,
        ),
      }));
    }
  },

  triggerSessionDreaming: async () => {
    const { messages, summaryState, activeProvider, activeModel, isSummarizingMemory } =
      get();
    if (isSummarizingMemory || messages.length < 6) return;

    const { toCompress } = splitMemoryTiers(messages, 4);
    if (toCompress.length === 0) return;

    set({ isSummarizingMemory: true });

    try {
      const apiKey = await getDecryptedApiKey(activeProvider);
      if (!apiKey) {
        set({ isSummarizingMemory: false });
        return;
      }

      const newSummary = await summarizeSessionHistory({
        previousSummary: summaryState,
        messagesToSummarize: toCompress,
        provider: activeProvider,
        apiKey,
        model: activeModel,
      });

      if (newSummary && newSummary.trim().length > 0) {
        set({ summaryState: newSummary, isSummarizingMemory: false });

        // Update history with fresh summary
        const currentMessages = get().messages;
        if (currentMessages.length > 0) {
          const firstUserMsg =
            currentMessages.find((m) => m.role === "user")?.content ||
            "Conversation";
          const title =
            firstUserMsg.slice(0, 32) + (firstUserMsg.length > 32 ? "…" : "");

          const context = useContextStore.getState().context;
          historyService.save({
            id: currentMessages[0]?.id || `convo-${Date.now()}`,
            title,
            timestamp: Date.now(),
            model: activeModel,
            provider: activeProvider,
            pageUrl: context?.url,
            pageType: context?.pageType,
            tags: [context?.pageType || "general", activeProvider],
            messageCount: currentMessages.length,
            summaryState: newSummary,
            messages: currentMessages,
          });
        }
      } else {
        set({ isSummarizingMemory: false });
      }
    } catch (err) {
      console.warn("Session Dreaming error:", err);
      set({ isSummarizingMemory: false });
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
    set({ messages: [], summaryState: "", isSummarizingMemory: false });
  },
}));
