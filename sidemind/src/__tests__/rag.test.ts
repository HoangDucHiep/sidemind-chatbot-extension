// SideMind · Client-side Local RAG Engine Unit Tests (Phase 3)

import { describe, it, expect } from "vitest";
import {
  chunkTextByWords,
  LocalRagEngine,
  retrieveRagContext,
} from "../lib/context/rag";
import { type PageContext } from "../lib/context/types";
import { type TabSource } from "../store/useMultiTab";
import { type FileAttachment } from "../lib/file-extractor";

describe("Text Chunking by Words", () => {
  it("should return single chunk if text is within maxWords limit", () => {
    const text = "This is a short text containing seven words.";
    const chunks = chunkTextByWords(text, 50, 10);

    expect(chunks.length).toBe(1);
    expect(chunks[0]).toBe(text);
  });

  it("should split long text into overlapping chunks", () => {
    const words = Array.from({ length: 300 }, (_, i) => `word${i + 1}`).join(" ");
    const chunks = chunkTextByWords(words, 100, 20);

    expect(chunks.length).toBeGreaterThan(1);
    // Overlapping words should be present in adjacent chunks
    const chunk1Words = chunks[0].split(/\s+/);
    const chunk2Words = chunks[1].split(/\s+/);
    expect(chunk1Words.slice(-10)).toEqual(chunk2Words.slice(10, 20));
  });

  it("should return empty array for empty string", () => {
    expect(chunkTextByWords("")).toEqual([]);
    expect(chunkTextByWords("   \n\t ")).toEqual([]);
  });
});

describe("LocalRagEngine Full-Text Semantic Search", () => {
  it("should index and retrieve the most relevant chunks based on query", () => {
    const mockContext: PageContext = {
      pageType: "article",
      url: "https://example.com/tech",
      title: "DevOps Trends",
      text: "Full text content",
      sentences: [
        { id: 1, text: "React and Vite provide great developer experience for frontend." },
        { id: 2, text: "Kubernetes orchestration manages microservices across distributed nodes." },
        { id: 3, text: "PostgreSQL offers robust ACID guarantees for relational data." },
      ],
      status: "ready",
    };

    const engine = new LocalRagEngine();
    engine.indexSources({ context: mockContext });

    expect(engine.getTotalChunkCount()).toBe(3);

    // Search for Kubernetes
    const k8sResults = engine.search("Kubernetes microservices", 2);
    expect(k8sResults.length).toBeGreaterThan(0);
    expect(k8sResults[0].text).toContain("Kubernetes orchestration");
    expect(k8sResults[0].chunkIndex).toBe(2);

    // Search for React
    const reactResults = engine.search("React frontend", 2);
    expect(reactResults.length).toBeGreaterThan(0);
    expect(reactResults[0].text).toContain("React and Vite");
    expect(reactResults[0].chunkIndex).toBe(1);
  });

  it("should support fuzzy search matching for minor typos", () => {
    const mockContext: PageContext = {
      pageType: "article",
      url: "https://example.com/ai",
      title: "Artificial Intelligence Guide",
      text: "Transformer neural networks revolutionized natural language processing.",
      sentences: [
        { id: 1, text: "Transformer neural networks revolutionized natural language processing." },
      ],
      status: "ready",
    };

    const engine = new LocalRagEngine();
    engine.indexSources({ context: mockContext });

    // Typo: "Transfomer" instead of "Transformer"
    const results = engine.search("Transfomer", 1);
    expect(results.length).toBe(1);
    expect(results[0].text).toContain("Transformer neural networks");
  });
});

describe("retrieveRagContext Integration", () => {
  it("should assemble relevant context from Page, Extra Tab, and File Attachment", () => {
    const context: PageContext = {
      pageType: "article",
      url: "https://example.com/main",
      title: "Main Article",
      text: "Architecture overview.",
      sentences: [
        { id: 1, text: "The system implements a client-side only Chrome extension." },
      ],
      status: "ready",
    };

    const extraTabs: TabSource[] = [
      {
        tabId: 10,
        title: "Documentation Tab",
        url: "https://docs.example.com",
        status: "ready",
        context: {
          pageType: "docs",
          url: "https://docs.example.com",
          title: "Documentation Tab",
          text: "Full docs",
          sentences: [
            { id: 1, text: "Security policy requires AES-GCM-256 for key encryption." },
          ],
          status: "ready",
        },
      },
    ];

    const attachments: FileAttachment[] = [
      {
        id: "file-1",
        name: "architecture_report.pdf",
        size: 1024,
        type: "application/pdf",
        isImage: false,
        extractedText: "Performance metrics show latency under 50ms for memory retrieval.",
      },
    ];

    const output = retrieveRagContext({
      context,
      extraTabs,
      attachments,
      query: "AES-GCM encryption and latency metrics",
      maxTokens: 2000,
    });

    // Check Active Page context
    expect(output).toContain("--- ACTIVE WEBPAGE CONTEXT (ARTICLE) ---");
    expect(output).toContain("[1] The system implements a client-side only Chrome extension.");

    // Check Tab context
    expect(output).toContain("--- EXTRA TAB SOURCE [tab1]: Documentation Tab ---");
    expect(output).toContain("[tab1] [1] Security policy requires AES-GCM-256 for key encryption.");

    // Check File Attachment context
    expect(output).toContain("--- ATTACHED FILE [file1]: architecture_report.pdf ---");
    expect(output).toContain("[file1] [1] Performance metrics show latency under 50ms for memory retrieval.");
  });

  it("should respect maxTokens budget limit", () => {
    const hugeSentences = Array.from({ length: 200 }, (_, i) => ({
      id: i + 1,
      text: `Sentence paragraph number ${i + 1} with repeated content for budget testing.`,
    }));

    const context: PageContext = {
      pageType: "article",
      url: "https://example.com/long",
      title: "Long Document",
      text: "Long text",
      sentences: hugeSentences,
      status: "ready",
    };

    const output = retrieveRagContext({
      context,
      query: "paragraph number",
      maxTokens: 300, // Small budget
    });

    expect(output).toContain("--- ACTIVE WEBPAGE CONTEXT (ARTICLE) ---");
    // Ensure huge sentences were capped and didn't dump all 200 items
    expect(output).not.toContain("[200]");
  });
});
