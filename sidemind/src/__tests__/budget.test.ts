// SideMind · Budgeting & Persona Unit Tests (Phase 1)

import { describe, it, expect } from "vitest";
import {
  estimateTokens,
  calculateTokenBudget,
  truncateTextToTokenBudget,
  applySentenceChunksBudget,
} from "../lib/context/budget";
import { buildSystemPrompt } from "../lib/context/prompts";

describe("Dynamic Context Budgeting Module", () => {
  it("should estimate token count correctly for English and Vietnamese", () => {
    const enText = "Hello world, this is a test prompt.";
    const viText = "Xin chào thế giới, đây là bài kiểm tra.";
    
    expect(estimateTokens(enText)).toBeGreaterThan(0);
    expect(estimateTokens(viText)).toBeGreaterThan(0);
    // Non-ASCII text should count as slightly more tokens
    expect(estimateTokens(viText)).toBeGreaterThan(estimateTokens("Short text"));
  });

  it("should calculate correct budget allocation breakdown", () => {
    const budget = calculateTokenBudget("gpt-4o-mini");
    
    expect(budget.totalLimit).toBe(12000);
    expect(budget.systemAndPersonaBudget).toBe(1200);
    expect(budget.workingMemoryBudget).toBe(3600);
    expect(budget.webAndFileContextBudget).toBe(7200);
    expect(budget.systemAndPersonaBudget + budget.workingMemoryBudget + budget.webAndFileContextBudget).toBe(budget.totalLimit);
  });

  it("should truncate raw text to fit max token budget", () => {
    const longText = "Sample word ".repeat(500); // Very long text
    const truncated = truncateTextToTokenBudget(longText, 50);
    
    expect(truncated.length).toBeLessThan(longText.length);
    expect(truncated).toContain("[Context Truncated]");
    expect(estimateTokens(truncated)).toBeLessThanOrEqual(70);
  });

  it("should apply sentence chunks budget cleanly without breaking sentence boundaries", () => {
    const chunks = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      text: `This is paragraph chunk number ${i + 1} with detailed technical content.`,
    }));

    const { chunks: filteredChunks } = applySentenceChunksBudget(chunks, 100);

    expect(filteredChunks.length).toBeLessThan(chunks.length);
    expect(filteredChunks.length).toBeGreaterThan(0);
    expect(filteredChunks[0].id).toBe(1);
  });
});

describe("System Prompt Assembly with Persona", () => {
  it("should inject User Persona instructions into system prompt", () => {
    const persona = "I am a TypeScript developer. Always respond in Vietnamese with bullet points.";
    const prompt = buildSystemPrompt(undefined, undefined, persona, "gpt-4o-mini");

    expect(prompt).toContain("--- USER PREFERENCES & PERSONA ---");
    expect(prompt).toContain(persona);
    expect(prompt).toContain("SideMind");
  });

  it("should apply budget truncation when context sentences are large", () => {
    const largeSentences = Array.from({ length: 600 }, (_, i) => ({
      id: i + 1,
      text: `Detailed sentence ${i + 1} describing the article context in depth with extra words to fill budget.`,
    }));

    const mockContext = {
      pageType: "article" as const,
      url: "https://example.com",
      title: "Test Article",
      text: "Test text",
      sentences: largeSentences,
      status: "ready" as const,
    };

    const prompt = buildSystemPrompt(mockContext, undefined, undefined, "gpt-4o-mini");

    expect(prompt).toContain("--- ACTIVE WEBPAGE CONTEXT (ARTICLE) ---");
    // Ensure 600 sentences are truncated by budget allocator
    expect(prompt).not.toContain("[600]");
    expect(prompt).toContain("[1]");
  });
});
