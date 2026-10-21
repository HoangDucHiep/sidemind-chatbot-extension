// SideMind · 3-Tier Memory Architecture & Session Dreaming Module (Phase 2)
// Compresses conversational history to reduce token consumption by 70-90%

import { type ChatMessage } from "../../store/useChat";
import { type AiMessage, type AiProvider, streamChat, DEFAULT_MODELS } from "../ai";
import { type FileAttachment } from "../file-extractor";

export interface MemoryTiers {
  workingMemory: ChatMessage[];
  toCompress: ChatMessage[];
  summaryState: string;
}

export interface AssemblePayloadOptions {
  systemPrompt: string;
  summaryState?: string;
  previousMessages: ChatMessage[];
  newPrompt: string;
  attachments?: FileAttachment[];
  workingMemoryCount?: number; // default: 4
}

export interface SummarizeHistoryParams {
  previousSummary?: string;
  messagesToSummarize: ChatMessage[];
  provider: AiProvider;
  apiKey: string;
  model?: string;
  signal?: AbortSignal;
}

const DEFAULT_WORKING_MEMORY_COUNT = 4;
export const DREAMING_THRESHOLD = 6;

/**
 * Splits existing conversation messages into Working Memory (recent N messages)
 * and messages that are candidates for compression (older messages).
 */
export function splitMemoryTiers(
  messages: ChatMessage[],
  workingCount: number = DEFAULT_WORKING_MEMORY_COUNT,
): { workingMemory: ChatMessage[]; toCompress: ChatMessage[] } {
  if (messages.length <= workingCount) {
    return {
      workingMemory: [...messages],
      toCompress: [],
    };
  }

  const splitIndex = messages.length - workingCount;
  return {
    toCompress: messages.slice(0, splitIndex),
    workingMemory: messages.slice(splitIndex),
  };
}

/**
 * Determines whether Session Dreaming (compression) should be triggered.
 */
export function shouldTriggerSessionDreaming(
  totalMessageCount: number,
  threshold: number = DREAMING_THRESHOLD,
): boolean {
  return totalMessageCount >= threshold;
}

/**
 * Assembles the 3-Tier Memory payload for LLM requests:
 * - Tier 3: System Prompt (Guidelines, Active Context, Tabs, Persona)
 * - Tier 2: Summary State (Condensed memory of older messages, if available)
 * - Tier 1: Working Memory (Up to 4 recent messages + new user message)
 */
export function assembleThreeTierPayload(
  options: AssemblePayloadOptions,
): AiMessage[] {
  const {
    systemPrompt,
    summaryState,
    previousMessages,
    newPrompt,
    attachments,
    workingMemoryCount = DEFAULT_WORKING_MEMORY_COUNT,
  } = options;

  const payload: AiMessage[] = [];

  // TIER 3 & TIER 2: System prompt combined with session summary
  let consolidatedSystemPrompt = systemPrompt;
  if (summaryState && summaryState.trim().length > 0) {
    consolidatedSystemPrompt += `\n\n--- PREVIOUS CONVERSATION SUMMARY (SESSION MEMORY) ---\n${summaryState.trim()}\n--- END PREVIOUS SUMMARY ---`;
  }

  payload.push({
    role: "system",
    content: consolidatedSystemPrompt,
  });

  // TIER 1: Working Memory (recent messages only)
  const { workingMemory } = splitMemoryTiers(previousMessages, workingMemoryCount);
  for (const msg of workingMemory) {
    payload.push({
      role: mRoleToAiRole(msg.role),
      content: msg.content,
      attachments: msg.attachments,
    });
  }

  // Current new user message
  payload.push({
    role: "user",
    content: newPrompt,
    attachments,
  });

  return payload;
}

function mRoleToAiRole(role: "user" | "assistant" | "system"): "user" | "assistant" | "system" {
  return role;
}

/**
 * Calls an AI model to condense older conversation messages into a concise summary under 150 words.
 */
export async function summarizeSessionHistory(
  params: SummarizeHistoryParams,
): Promise<string> {
  const {
    previousSummary,
    messagesToSummarize,
    provider,
    apiKey,
    model = DEFAULT_MODELS[provider],
    signal,
  } = params;

  if (messagesToSummarize.length === 0) {
    return previousSummary || "";
  }

  // Format messages for the summarizer
  const transcript = messagesToSummarize
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const promptContent = previousSummary
    ? `You are SideMind's Session Memory Consolidation Engine.
Combine and compress the previous summary with the new conversation transcript into a single concise summary under 150 words.
Preserve key facts, decisions, technical context, and established requirements. Do not add conversational filler.

--- PREVIOUS SUMMARY ---
${previousSummary}

--- NEW MESSAGES TO CONSOLIDATE ---
${transcript}

--- INSTRUCTION ---
Write a single, updated summary reflecting both previous context and new messages:`
    : `You are SideMind's Session Memory Consolidation Engine.
Summarize the following dialogue concisely in under 150 words.
Preserve key decisions, facts, user goals, and established context. Do not include conversational filler.

--- DIALOGUE TRANSCRIPT ---
${transcript}

--- CONCISE SUMMARY ---`;

  const messages: AiMessage[] = [
    {
      role: "system",
      content: "You are a concise, factual text summarizer specialized in conversational memory consolidation.",
    },
    {
      role: "user",
      content: promptContent,
    },
  ];

  try {
    const stream = streamChat(
      provider,
      messages,
      {
        apiKey,
        model,
        temperature: 0.3, // Lower temperature for factual summary
        maxTokens: 512,
      },
      signal,
    );

    let summary = "";
    for await (const chunk of stream) {
      summary += chunk;
    }

    return summary.trim();
  } catch (err) {
    console.warn("Session Dreaming summarization failed:", err);
    // Return existing summary fallback if summarization fails
    return previousSummary || "";
  }
}
