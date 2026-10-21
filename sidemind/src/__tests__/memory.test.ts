// SideMind · 3-Tier Memory & Session Dreaming Unit Tests (Phase 2)

import { describe, it, expect, vi } from "vitest";
import {
  splitMemoryTiers,
  shouldTriggerSessionDreaming,
  assembleThreeTierPayload,
  summarizeSessionHistory,
  DREAMING_THRESHOLD,
} from "../lib/context/memory";
import { type ChatMessage } from "../store/useChat";
import * as aiModule from "../lib/ai";

describe("3-Tier Memory Tier Splitting", () => {
  it("should place all messages into working memory when count <= 4", () => {
    const messages: ChatMessage[] = [
      { id: "1", role: "user", content: "Hi", timestamp: 100 },
      { id: "2", role: "assistant", content: "Hello", timestamp: 200 },
    ];

    const { workingMemory, toCompress } = splitMemoryTiers(messages, 4);

    expect(workingMemory.length).toBe(2);
    expect(toCompress.length).toBe(0);
    expect(workingMemory[0].id).toBe("1");
    expect(workingMemory[1].id).toBe("2");
  });

  it("should accurately split older messages into toCompress when count > 4", () => {
    const messages: ChatMessage[] = Array.from({ length: 10 }, (_, i) => ({
      id: `msg-${i + 1}`,
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Message content ${i + 1}`,
      timestamp: 1000 + i,
    }));

    const { workingMemory, toCompress } = splitMemoryTiers(messages, 4);

    // Working memory should have exactly the last 4 messages
    expect(workingMemory.length).toBe(4);
    expect(workingMemory[0].id).toBe("msg-7");
    expect(workingMemory[3].id).toBe("msg-10");

    // toCompress should have the first 6 messages
    expect(toCompress.length).toBe(6);
    expect(toCompress[0].id).toBe("msg-1");
    expect(toCompress[5].id).toBe("msg-6");
  });

  it("should handle empty message array gracefully", () => {
    const { workingMemory, toCompress } = splitMemoryTiers([], 4);
    expect(workingMemory.length).toBe(0);
    expect(toCompress.length).toBe(0);
  });
});

describe("Session Dreaming Trigger Condition", () => {
  it("should not trigger dreaming below threshold", () => {
    expect(shouldTriggerSessionDreaming(0)).toBe(false);
    expect(shouldTriggerSessionDreaming(5)).toBe(false);
    expect(shouldTriggerSessionDreaming(DREAMING_THRESHOLD - 1)).toBe(false);
  });

  it("should trigger dreaming at or above threshold", () => {
    expect(shouldTriggerSessionDreaming(DREAMING_THRESHOLD)).toBe(true);
    expect(shouldTriggerSessionDreaming(10)).toBe(true);
    expect(shouldTriggerSessionDreaming(50)).toBe(true);
  });
});

describe("Assemble 3-Tier Payload", () => {
  it("should assemble payload with Tier 3 (System) + Tier 1 (Working) + Current User Query", () => {
    const previousMessages: ChatMessage[] = [
      { id: "1", role: "user", content: "Query 1", timestamp: 1 },
      { id: "2", role: "assistant", content: "Answer 1", timestamp: 2 },
    ];

    const payload = assembleThreeTierPayload({
      systemPrompt: "Base system instructions",
      previousMessages,
      newPrompt: "Latest question",
    });

    expect(payload.length).toBe(4);
    expect(payload[0].role).toBe("system");
    expect(payload[0].content).toBe("Base system instructions");
    expect(payload[1].role).toBe("user");
    expect(payload[1].content).toBe("Query 1");
    expect(payload[2].role).toBe("assistant");
    expect(payload[2].content).toBe("Answer 1");
    expect(payload[3].role).toBe("user");
    expect(payload[3].content).toBe("Latest question");
  });

  it("should inject Tier 2 (Session Memory) into system prompt when available", () => {
    const previousMessages: ChatMessage[] = Array.from({ length: 8 }, (_, i) => ({
      id: `msg-${i + 1}`,
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Content ${i + 1}`,
      timestamp: i,
    }));

    const summary = "User is building a React extension and decided on Zustand.";

    const payload = assembleThreeTierPayload({
      systemPrompt: "Base system prompt",
      summaryState: summary,
      previousMessages,
      newPrompt: "What is next?",
      workingMemoryCount: 4,
    });

    // Check System message contains summary
    expect(payload[0].role).toBe("system");
    expect(payload[0].content).toContain("--- PREVIOUS CONVERSATION SUMMARY (SESSION MEMORY) ---");
    expect(payload[0].content).toContain(summary);

    // Check payload only contains 1 System + 4 Working + 1 New User = 6 messages
    expect(payload.length).toBe(6);
    expect(payload[1].content).toBe("Content 5"); // First message in working memory
    expect(payload[4].content).toBe("Content 8"); // Last message in working memory
    expect(payload[5].content).toBe("What is next?"); // New query
  });
});

describe("Session Dreaming Summarization Engine", () => {
  it("should return empty or previous summary when toCompress is empty", async () => {
    const result = await summarizeSessionHistory({
      previousSummary: "Existing summary",
      messagesToSummarize: [],
      provider: "gemini",
      apiKey: "dummy-key",
    });

    expect(result).toBe("Existing summary");
  });

  it("should call streamChat and collect summary output", async () => {
    const mockSummaryText = "User asked about React architecture and chosed TypeScript.";
    
    // Mock streamChat generator
    async function* mockStream() {
      yield "User asked about ";
      yield "React architecture and ";
      yield "chosed TypeScript.";
    }

    vi.spyOn(aiModule, "streamChat").mockReturnValue(mockStream() as any);

    const toCompress: ChatMessage[] = [
      { id: "1", role: "user", content: "Tell me about React architecture", timestamp: 1 },
      { id: "2", role: "assistant", content: "Here are details...", timestamp: 2 },
    ];

    const summary = await summarizeSessionHistory({
      messagesToSummarize: toCompress,
      provider: "gemini",
      apiKey: "dummy-key",
    });

    expect(summary).toBe(mockSummaryText);
    vi.restoreAllMocks();
  });
});
