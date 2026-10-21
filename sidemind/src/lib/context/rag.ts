// SideMind · Client-side Local RAG Engine (MiniSearch) (Phase 3)
// Fast full-text semantic indexing & retrieval for large PDFs, multi-tabs, and documents

import MiniSearch from "minisearch";
import { type PageContext } from "./types";
import { type TabSource } from "../../store/useMultiTab";
import { type FileAttachment } from "../file-extractor";
import { estimateTokens } from "./budget";

export interface RagChunk {
  id: string; // Unique chunk ID
  sourceId: string; // "active", "tab-{id}", "file-{id}"
  sourceTitle: string;
  sourceType: "active" | "tab" | "attachment";
  chunkIndex: number;
  text: string;
  pageNumber?: number;
  timestampStr?: string;
}

export interface BuildRagIndexOptions {
  context?: PageContext;
  extraTabs?: TabSource[];
  attachments?: FileAttachment[];
}

export interface RetrieveRagOptions extends BuildRagIndexOptions {
  query?: string;
  maxTokens: number;
}

/**
 * Splits continuous text into overlapping word chunks (~150 words with 25 words overlap).
 */
export function chunkTextByWords(
  text: string,
  maxWords: number = 150,
  overlapWords: number = 25,
): string[] {
  if (!text || text.trim().length === 0) return [];

  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return [text.trim()];

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < words.length) {
    const chunkWords = words.slice(startIndex, startIndex + maxWords);
    chunks.push(chunkWords.join(" "));
    startIndex += maxWords - overlapWords;
    if (startIndex + overlapWords >= words.length && startIndex < words.length) {
      // Last trailing partial chunk
      chunks.push(words.slice(startIndex).join(" "));
      break;
    }
  }

  return chunks;
}

/**
 * Local RAG Engine powered by MiniSearch running 100% in browser memory.
 */
export class LocalRagEngine {
  private miniSearch: MiniSearch<RagChunk>;
  private chunks: RagChunk[] = [];
  private indexedCount: number = 0;

  constructor() {
    this.miniSearch = new MiniSearch<RagChunk>({
      fields: ["text", "sourceTitle"],
      storeFields: [
        "id",
        "sourceId",
        "sourceTitle",
        "sourceType",
        "chunkIndex",
        "text",
        "pageNumber",
        "timestampStr",
      ],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        boost: { text: 2, sourceTitle: 1 },
      },
    });
  }

  /**
   * Clears and indexes all active page contexts, extra tabs, and file attachments.
   */
  public indexSources(options: BuildRagIndexOptions): void {
    this.chunks = [];
    const allChunks: RagChunk[] = [];

    // 1. Index Active Webpage Context
    if (options.context && options.context.text) {
      const ctx = options.context;
      if (ctx.sentences && ctx.sentences.length > 0) {
        ctx.sentences.forEach((s) => {
          allChunks.push({
            id: `active-${s.id}`,
            sourceId: "active",
            sourceTitle: ctx.title || "Active Page",
            sourceType: "active",
            chunkIndex: s.id,
            text: s.text,
            pageNumber: s.pageNumber,
            timestampStr: s.timestampStr,
          });
        });
      } else {
        const textChunks = chunkTextByWords(ctx.text);
        textChunks.forEach((chunkText, idx) => {
          allChunks.push({
            id: `active-${idx + 1}`,
            sourceId: "active",
            sourceTitle: ctx.title || "Active Page",
            sourceType: "active",
            chunkIndex: idx + 1,
            text: chunkText,
          });
        });
      }
    }

    // 2. Index Multi-Tab Contexts
    if (options.extraTabs && options.extraTabs.length > 0) {
      options.extraTabs.forEach((tab, tabIdx) => {
        const tabNum = tabIdx + 1;
        const tabCtx = tab.context;
        if (tabCtx && tabCtx.sentences && tabCtx.sentences.length > 0) {
          tabCtx.sentences.forEach((s) => {
            allChunks.push({
              id: `tab${tabNum}-${s.id}`,
              sourceId: `tab${tabNum}`,
              sourceTitle: tab.title,
              sourceType: "tab",
              chunkIndex: s.id,
              text: s.text,
            });
          });
        } else if (tabCtx && tabCtx.text) {
          const tabChunks = chunkTextByWords(tabCtx.text);
          tabChunks.forEach((chunkText, idx) => {
            allChunks.push({
              id: `tab${tabNum}-${idx + 1}`,
              sourceId: `tab${tabNum}`,
              sourceTitle: tab.title,
              sourceType: "tab",
              chunkIndex: idx + 1,
              text: chunkText,
            });
          });
        }
      });
    }

    // 3. Index File Attachments (Text/Code/PDF)
    if (options.attachments && options.attachments.length > 0) {
      options.attachments.forEach((file, fileIdx) => {
        const fileNum = fileIdx + 1;
        if (!file.isImage && file.extractedText) {
          const fileChunks = chunkTextByWords(file.extractedText);
          fileChunks.forEach((chunkText, idx) => {
            allChunks.push({
              id: `file${fileNum}-${idx + 1}`,
              sourceId: `file${fileNum}`,
              sourceTitle: file.name,
              sourceType: "attachment",
              chunkIndex: idx + 1,
              text: chunkText,
            });
          });
        }
      });
    }

    this.chunks = allChunks;
    this.miniSearch.removeAll();
    if (allChunks.length > 0) {
      this.miniSearch.addAll(allChunks);
    }
    this.indexedCount = allChunks.length;
  }

  /**
   * Searches for Top-K most relevant chunks based on query.
   * If search yields fewer results, pads with initial sequential chunks.
   */
  public search(query?: string, topK: number = 8): RagChunk[] {
    if (!query || query.trim().length === 0 || this.indexedCount === 0) {
      return this.chunks.slice(0, topK);
    }

    const trimmedQuery = query.trim();
    // Execute MiniSearch ranking
    const searchResults = this.miniSearch.search(trimmedQuery);

    if (searchResults.length > 0) {
      const resultIds = new Set<string>();
      const topChunks: RagChunk[] = [];

      for (const res of searchResults) {
        if (topChunks.length >= topK) break;
        const found = this.chunks.find((c) => c.id === res.id);
        if (found && !resultIds.has(found.id)) {
          resultIds.add(found.id);
          topChunks.push(found);
        }
      }

      // Pad with first sequential chunks if query didn't fill topK
      if (topChunks.length < topK) {
        for (const c of this.chunks) {
          if (topChunks.length >= topK) break;
          if (!resultIds.has(c.id)) {
            resultIds.add(c.id);
            topChunks.push(c);
          }
        }
      }

      return topChunks;
    }

    // Fallback to top sequential chunks
    return this.chunks.slice(0, topK);
  }

  public getTotalChunkCount(): number {
    return this.indexedCount;
  }
}

/**
 * High-level helper: Retrieves and formats relevant context using Local RAG
 * bounded strictly within the specified token budget.
 */
export function retrieveRagContext(options: RetrieveRagOptions): string {
  const { context, extraTabs, attachments, query, maxTokens } = options;

  const engine = new LocalRagEngine();
  engine.indexSources({ context, extraTabs, attachments });

  if (engine.getTotalChunkCount() === 0) {
    return "";
  }

  // Determine topK based on available token budget (average chunk ~120 tokens)
  const estimatedTopK = Math.max(4, Math.min(25, Math.floor(maxTokens / 120)));
  const relevantChunks = engine.search(query, estimatedTopK);

  let formattedBlock = "";
  let accumulatedTokens = 0;

  // Group retrieved chunks by source
  const activeChunks: RagChunk[] = [];
  const tabChunksMap = new Map<string, RagChunk[]>();
  const fileChunksMap = new Map<string, RagChunk[]>();

  for (const chunk of relevantChunks) {
    if (chunk.sourceType === "active") {
      activeChunks.push(chunk);
    } else if (chunk.sourceType === "tab") {
      const list = tabChunksMap.get(chunk.sourceId) || [];
      list.push(chunk);
      tabChunksMap.set(chunk.sourceId, list);
    } else if (chunk.sourceType === "attachment") {
      const list = fileChunksMap.get(chunk.sourceId) || [];
      list.push(chunk);
      fileChunksMap.set(chunk.sourceId, list);
    }
  }

  // Format Active Page Chunks
  if (activeChunks.length > 0 && context) {
    formattedBlock += `\n\n--- ACTIVE WEBPAGE CONTEXT (${context.pageType.toUpperCase()}) ---`;
    formattedBlock += `\nTitle: ${context.title}\nURL: ${context.url}\n\nRelevant Content Chunks:\n`;

    for (const c of activeChunks) {
      const extra = c.timestampStr
        ? ` (Time: ${c.timestampStr})`
        : c.pageNumber
          ? ` (Page ${c.pageNumber})`
          : "";
      const line = `[${c.chunkIndex}]${extra} ${c.text}\n`;
      const lineTokens = estimateTokens(line);
      if (accumulatedTokens + lineTokens > maxTokens) break;
      formattedBlock += line;
      accumulatedTokens += lineTokens;
    }
    formattedBlock += `--- END ACTIVE CONTEXT ---\n`;
  }

  // Format Extra Tabs Chunks
  for (const [sourceId, chunks] of tabChunksMap.entries()) {
    if (accumulatedTokens >= maxTokens) break;
    const firstChunk = chunks[0];
    formattedBlock += `\n\n--- EXTRA TAB SOURCE [${sourceId}]: ${firstChunk.sourceTitle} ---\n`;
    for (const c of chunks) {
      const line = `[${sourceId}] [${c.chunkIndex}] ${c.text}\n`;
      const lineTokens = estimateTokens(line);
      if (accumulatedTokens + lineTokens > maxTokens) break;
      formattedBlock += line;
      accumulatedTokens += lineTokens;
    }
    formattedBlock += `--- END TAB [${sourceId}] ---\n`;
  }

  // Format File Attachment Chunks
  for (const [sourceId, chunks] of fileChunksMap.entries()) {
    if (accumulatedTokens >= maxTokens) break;
    const firstChunk = chunks[0];
    formattedBlock += `\n\n--- ATTACHED FILE [${sourceId}]: ${firstChunk.sourceTitle} ---\n`;
    for (const c of chunks) {
      const line = `[${sourceId}] [${c.chunkIndex}] ${c.text}\n`;
      const lineTokens = estimateTokens(line);
      if (accumulatedTokens + lineTokens > maxTokens) break;
      formattedBlock += line;
      accumulatedTokens += lineTokens;
    }
    formattedBlock += `--- END FILE [${sourceId}] ---\n`;
  }

  return formattedBlock;
}
