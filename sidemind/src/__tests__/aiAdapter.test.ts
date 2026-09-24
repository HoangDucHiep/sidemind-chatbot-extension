import { describe, it, expect } from "vitest";
import { getAiAdapter, DEFAULT_MODELS, AVAILABLE_MODELS } from "../lib/ai";

describe("AI Adapter Factory & Configuration", () => {
  it("should instantiate adapters and export default models for all providers", () => {
    const openai = getAiAdapter("openai");
    expect(openai.provider).toBe("openai");
    expect(DEFAULT_MODELS.openai).toBe("gpt-4o-mini");
    expect(AVAILABLE_MODELS.openai.length).toBeGreaterThan(0);

    const anthropic = getAiAdapter("anthropic");
    expect(anthropic.provider).toBe("anthropic");
    expect(DEFAULT_MODELS.anthropic).toBe("claude-3-5-haiku-20241022");
    expect(AVAILABLE_MODELS.anthropic.length).toBeGreaterThan(0);

    const gemini = getAiAdapter("gemini");
    expect(gemini.provider).toBe("gemini");
    expect(DEFAULT_MODELS.gemini).toBe("gemini-3.6-flash");
    expect(AVAILABLE_MODELS.gemini.length).toBeGreaterThan(0);
  });

  it("should throw error for unsupported provider", () => {
    // @ts-expect-error testing invalid provider input
    expect(() => getAiAdapter("invalid_provider")).toThrow(
      /Unsupported AI provider/,
    );
  });
});
