import { describe, it, expect } from "vitest";
import { classifyPageType } from "../lib/context/classifier";

describe("Context Classifier (FR-04)", () => {
  it("should classify youtube.com/watch URLs as youtube", () => {
    expect(
      classifyPageType("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe("youtube");
    expect(classifyPageType("https://youtu.be/dQw4w9WgXcQ")).toBe("youtube");
  });

  it("should classify PDF URLs as pdf", () => {
    expect(classifyPageType("https://arxiv.org/pdf/2301.00001.pdf")).toBe(
      "pdf",
    );
    expect(classifyPageType("https://example.com/document.pdf?version=1")).toBe(
      "pdf",
    );
  });

  it("should classify technical documentation sites as docs", () => {
    expect(
      classifyPageType("https://docs.python.org/3/library/asyncio.html"),
    ).toBe("docs");
    expect(
      classifyPageType("https://developer.mozilla.org/en-US/docs/Web/API"),
    ).toBe("docs");
    expect(classifyPageType("https://react.dev/reference/react/useState")).toBe(
      "docs",
    );
  });

  it("should classify standard URLs as general by default without DOM", () => {
    expect(classifyPageType("https://example.com")).toBe("general");
  });
});
