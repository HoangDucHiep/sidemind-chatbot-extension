// SideMind · Context Prompts & System Templates

import { type PageContext } from "./types";
import { type TabSource } from "../../store/useMultiTab";

export function buildSystemPrompt(
  context?: PageContext,
  extraTabs?: TabSource[],
): string {
  const basePrompt = `You are SideMind, an intelligent AI assistant integrated into the browser sidebar.
Your goal is to provide accurate, concise, and helpful answers based on the user's active webpage context and attached resources.

GUIDELINES:
1. Ground your answers in the provided context and attached files whenever relevant.
2. When referencing specific statements or data from the main page context, include numbered citations formatted like [1], [2].
3. When referencing extra tab sources, include tab-prefixed citations formatted like [tab1] [1], [tab2] [2].
4. Use clean Markdown formatting (headings, bullet points, bold text, code blocks) to make your answers easy to read.
5. If the user asks in Vietnamese, respond in Vietnamese. If the user asks in English, respond in English.
6. If the context does not contain the answer, answer based on your general knowledge and clearly state that it is not mentioned on the current page.`;

  let contextBlock = "";

  if (context && context.text) {
    contextBlock += `\n\n--- ACTIVE WEBPAGE CONTEXT (${context.pageType.toUpperCase()}) ---`;
    contextBlock += `\nTitle: ${context.title}`;
    contextBlock += `\nURL: ${context.url}\n`;

    if (context.sentences && context.sentences.length > 0) {
      contextBlock += `\nNumbered Content Chunks:\n`;
      const chunks = context.sentences.slice(0, 35);
      for (const chunk of chunks) {
        const extra = chunk.timestampStr
          ? ` (Time: ${chunk.timestampStr})`
          : chunk.pageNumber
            ? ` (Page ${chunk.pageNumber})`
            : "";
        contextBlock += `[${chunk.id}]${extra} ${chunk.text}\n`;
      }
    } else {
      contextBlock += `\nContent:\n${context.text.slice(0, 6000)}`;
    }
    contextBlock += `\n--- END ACTIVE CONTEXT ---\n`;
  }

  // Include multi-tab contexts if present
  if (extraTabs && extraTabs.length > 0) {
    extraTabs.forEach((tab, index) => {
      const tabNum = index + 1;
      const tabCtx = tab.context;
      contextBlock += `\n\n--- EXTRA TAB SOURCE [tab${tabNum}]: ${tab.title} ---`;
      contextBlock += `\nURL: ${tab.url}\n`;
      if (tabCtx && tabCtx.sentences && tabCtx.sentences.length > 0) {
        contextBlock += `\nNumbered Content Chunks:\n`;
        const chunks = tabCtx.sentences.slice(0, 20);
        for (const chunk of chunks) {
          contextBlock += `[tab${tabNum}] [${chunk.id}] ${chunk.text}\n`;
        }
      } else if (tabCtx?.text) {
        contextBlock += `\nContent:\n${tabCtx.text.slice(0, 3000)}`;
      }
      contextBlock += `\n--- END TAB [tab${tabNum}] ---\n`;
    });
  }

  return basePrompt + contextBlock;
}

export const SLASH_COMMANDS: Record<
  string,
  { prompt: string; descEn: string; descVi: string }
> = {
  "/summary": {
    prompt:
      "Summarize the main content of this page into 5 concise, actionable bullet points with key takeaways.",
    descEn: "Five-bullet summary",
    descVi: "Tóm tắt 5 gạch đầu dòng",
  },
  "/tldr": {
    prompt: "Provide a single-sentence TL;DR summary of this entire page.",
    descEn: "One-line summary",
    descVi: "Tóm tắt trong 1 câu duy nhất",
  },
  "/explain": {
    prompt:
      "Explain the concepts discussed on this page in simple terms with step-by-step clarity.",
    descEn: "Explain concepts step by step",
    descVi: "Giải thích đơn giản từng bước",
  },
  "/translate": {
    prompt:
      "Translate the main points of this page into Vietnamese (if English) or English (if Vietnamese).",
    descEn: "Translate page content",
    descVi: "Dịch nội dung trang",
  },
  "/rewrite": {
    prompt:
      "Rewrite the key message of this page in a professional, polished editorial style.",
    descEn: "Rewrite in polished style",
    descVi: "Viết lại theo phong cách chuyên nghiệp",
  },
  "/code": {
    prompt:
      "Extract and explain all code snippets, APIs, and technical steps mentioned on this page.",
    descEn: "Extract and explain code snippets",
    descVi: "Bóc tách và giải thích mã nguồn",
  },
  "/full": {
    prompt:
      "Provide a structured, comprehensive summary covering all sections and important details of this page.",
    descEn: "Full comprehensive summary",
    descVi: "Tóm tắt đầy đủ toàn bộ nội dung",
  },
  "/tabs": {
    prompt: "Show multi-tab sources",
    descEn: "Select multi-tab context sources",
    descVi: "Chọn thêm tab nguồn ngữ cảnh",
  },
  "/attach": {
    prompt: "Attach local files",
    descEn: "Attach images, PDFs, or documents",
    descVi: "Đính kèm tệp, ảnh hoặc tài liệu",
  },
};
