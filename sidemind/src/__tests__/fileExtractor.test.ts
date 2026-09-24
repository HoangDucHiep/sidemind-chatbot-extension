import { describe, it, expect } from "vitest";
import { processFile } from "../lib/file-extractor";

describe("File Attachment Extractor & Limits", () => {
  it("should reject files larger than 50 MB with an error", async () => {
    // Create a mock File with 51 MB size
    const oversizedFile = {
      name: "large_archive.zip",
      size: 51 * 1024 * 1024,
      type: "application/zip",
    } as unknown as File;

    await expect(processFile(oversizedFile)).rejects.toThrow(
      /exceeds the 50 MB hard limit/,
    );
  });

  it("should extract text from plain text files", async () => {
    const textContent = "Hello SideMind!\nThis is a test document.";
    const blob = new Blob([textContent], { type: "text/plain" });
    const textFile = new File([blob], "test.txt", { type: "text/plain" });

    const result = await processFile(textFile);
    expect(result.name).toBe("test.txt");
    expect(result.isImage).toBe(false);
    expect(result.extractedText).toBe(textContent);
    expect(result.tokenEstimate).toBeGreaterThan(0);
  });

  it("should handle markdown and code files", async () => {
    const codeContent = 'function greet() { console.log("hi"); }';
    const blob = new Blob([codeContent], { type: "text/javascript" });
    const codeFile = new File([blob], "index.js", { type: "text/javascript" });

    const result = await processFile(codeFile);
    expect(result.name).toBe("index.js");
    expect(result.isImage).toBe(false);
    expect(result.extractedText).toBe(codeContent);
  });
});
