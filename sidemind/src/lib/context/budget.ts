// SideMind · Dynamic Context Budgeting Module
// Calculates token limits and allocates context budget based on AI model specifications

import { type SentenceChunk } from "./types";

export interface TokenBudget {
  totalLimit: number;
  systemAndPersonaBudget: number; // 10% max
  workingMemoryBudget: number;    // 30% max
  webAndFileContextBudget: number; // 60% max
}

// Model context window limits in tokens
const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  // OpenAI
  "gpt-4o": 128000,
  "gpt-4o-mini": 128000,
  "gpt-4-turbo": 128000,
  "gpt-3.5-turbo": 16385,
  // Anthropic
  "claude-3-5-sonnet-20241022": 200000,
  "claude-3-haiku-20240307": 200000,
  "claude-3-opus-20240229": 200000,
  // Gemini
  "gemini-1.5-pro": 1000000,
  "gemini-1.5-flash": 1000000,
  "gemini-3.6-flash": 1000000,
};

// Default fallback budget for input context if model context limit is unknown
const DEFAULT_INPUT_CONTEXT_LIMIT = 12000;

/**
 * Fast client-side token count estimator.
 * Rule of thumb: ~3.5 chars per token for English/Code, ~2 chars per token for Vietnamese UTF-8.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Non-ASCII characters (e.g., Vietnamese unicode) consume slightly more tokens per char
  const nonAsciiCount = (text.match(/[^\x00-\x7F]/g) || []).length;
  const asciiCount = text.length - nonAsciiCount;
  return Math.ceil(asciiCount / 3.8 + nonAsciiCount / 2.0);
}

/**
 * Returns the maximum context window limit for a given model ID.
 */
export function getModelContextLimit(modelId: string): number {
  return MODEL_CONTEXT_LIMITS[modelId] || DEFAULT_INPUT_CONTEXT_LIMIT;
}

/**
 * Calculates token budget breakdown for a model.
 * Enforces safe caps so input prompts stay within efficient, cost-effective bounds.
 */
export function calculateTokenBudget(
  modelId?: string,
  customInputLimit?: number,
): TokenBudget {
  const modelLimit = modelId ? getModelContextLimit(modelId) : DEFAULT_INPUT_CONTEXT_LIMIT;
  // Cap effective input context budget to avoid ballooning API costs
  const totalInputLimit = customInputLimit || Math.min(modelLimit * 0.5, DEFAULT_INPUT_CONTEXT_LIMIT);

  return {
    totalLimit: Math.round(totalInputLimit),
    systemAndPersonaBudget: Math.round(totalInputLimit * 0.1),  // 10%
    workingMemoryBudget: Math.round(totalInputLimit * 0.3),     // 30%
    webAndFileContextBudget: Math.round(totalInputLimit * 0.6), // 60%
  };
}

/**
 * Truncates raw text to fit within a given token budget.
 */
export function truncateTextToTokenBudget(text: string, maxTokens: number): string {
  if (!text || maxTokens <= 0) return "";
  const currentTokens = estimateTokens(text);
  if (currentTokens <= maxTokens) return text;

  // Approximate character limit
  const targetCharCount = Math.floor(maxTokens * 3.2);
  const truncated = text.slice(0, targetCharCount);
  
  // Cut at last full word boundary
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + " ... [Context Truncated]";
}

/**
 * Truncates sentence chunks to fit within a target token budget while preserving sentence integrity.
 */
export function applySentenceChunksBudget(
  chunks: SentenceChunk[],
  maxTokens: number,
): { chunks: SentenceChunk[]; totalTokens: number } {
  const selected: SentenceChunk[] = [];
  let accumulatedTokens = 0;

  for (const chunk of chunks) {
    const chunkTokens = estimateTokens(`[${chunk.id}] ${chunk.text}`);
    if (accumulatedTokens + chunkTokens > maxTokens) {
      break;
    }
    selected.push(chunk);
    accumulatedTokens += chunkTokens;
  }

  return { chunks: selected, totalTokens: accumulatedTokens };
}
