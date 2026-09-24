import { describe, it, expect } from "vitest";
import { buildSystemPrompt, SLASH_COMMANDS } from "../lib/context/prompts";
import { type PageContext } from "../lib/context/types";
import { type TabSource } from "../store/useMultiTab";

describe("System Prompts & Citation Indexing (FR-04 & FR-11)", () => {
  it("should generate base prompt when context is empty", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("You are SideMind");
    expect(prompt).not.toContain("--- ACTIVE WEBPAGE CONTEXT");
  });

  it("should include numbered sentence chunks for single page context", () => {
    const mockContext: PageContext = {
      pageType: "article",
      url: "https://example.com/article",
      title: "Sample Article",
      text: "First chunk. Second chunk.",
      sentences: [
        { id: 1, text: "First chunk." },
        { id: 2, text: "Second chunk." },
      ],
      status: "ready",
    };

    const prompt = buildSystemPrompt(mockContext);
    expect(prompt).toContain("--- ACTIVE WEBPAGE CONTEXT (ARTICLE) ---");
    expect(prompt).toContain("[1] First chunk.");
    expect(prompt).toContain("[2] Second chunk.");
  });

  it("should format multi-tab context with [tabN] prefix", () => {
    const mockContext: PageContext = {
      pageType: "general",
      url: "https://example.com/main",
      title: "Main Tab",
      text: "Main content.",
      sentences: [{ id: 1, text: "Main content." }],
      status: "ready",
    };

    const extraTabs: TabSource[] = [
      {
        tabId: 101,
        title: "Extra Tab 1",
        url: "https://example.com/extra1",
        status: "ready",
        context: {
          pageType: "docs",
          url: "https://example.com/extra1",
          title: "Extra Tab 1",
          text: "Extra content 1.",
          sentences: [{ id: 1, text: "Extra content 1." }],
          status: "ready",
        },
      },
    ];

    const prompt = buildSystemPrompt(mockContext, extraTabs);
    expect(prompt).toContain("--- EXTRA TAB SOURCE [tab1]: Extra Tab 1 ---");
    expect(prompt).toContain("[tab1] [1] Extra content 1.");
  });

  it("should contain all required slash commands", () => {
    expect(SLASH_COMMANDS["/summary"]).toBeDefined();
    expect(SLASH_COMMANDS["/tldr"]).toBeDefined();
    expect(SLASH_COMMANDS["/explain"]).toBeDefined();
    expect(SLASH_COMMANDS["/translate"]).toBeDefined();
    expect(SLASH_COMMANDS["/rewrite"]).toBeDefined();
    expect(SLASH_COMMANDS["/code"]).toBeDefined();
    expect(SLASH_COMMANDS["/full"]).toBeDefined();
    expect(SLASH_COMMANDS["/tabs"]).toBeDefined();
    expect(SLASH_COMMANDS["/attach"]).toBeDefined();
  });
});
