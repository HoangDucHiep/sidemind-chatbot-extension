// SideMind · Context Prompts & System Templates

import { type PageContext } from './types';

export function buildSystemPrompt(context?: PageContext): string {
  let basePrompt = `You are SideMind, an intelligent AI assistant integrated into the browser sidebar.
Your goal is to provide accurate, concise, and helpful answers based on the user's active webpage context.

GUIDELINES:
1. Ground your answers in the provided context whenever relevant.
2. When referencing specific statements, facts, or data points from the context, include numbered citations formatted exactly like [1], [2], [3] at the end of the claim.
3. Use clean Markdown formatting (headings, bullet points, bold text, code blocks) to make your answers easy to read.
4. If the user asks in Vietnamese, respond in Vietnamese. If the user asks in English, respond in English.
5. If the context does not contain the answer, answer based on your general knowledge and clearly state that it is not mentioned on the current page.`;

  if (!context || !context.text) {
    return basePrompt;
  }

  // Format numbered sentence chunks for citation indexing
  let contextBlock = `\n\n--- WEBPAGE CONTEXT (${context.pageType.toUpperCase()}) ---`;
  contextBlock += `\nTitle: ${context.title}`;
  contextBlock += `\nURL: ${context.url}\n`;

  if (context.sentences && context.sentences.length > 0) {
    contextBlock += `\nNumbered Content Chunks:\n`;
    // Cap at 40 chunks to avoid token overflow
    const chunks = context.sentences.slice(0, 40);
    for (const chunk of chunks) {
      const extra = chunk.timestampStr
        ? ` (Time: ${chunk.timestampStr})`
        : chunk.pageNumber
          ? ` (Page ${chunk.pageNumber})`
          : '';
      contextBlock += `[${chunk.id}]${extra} ${chunk.text}\n`;
    }
  } else {
    contextBlock += `\nContent:\n${context.text.slice(0, 8000)}`;
  }

  contextBlock += `\n--- END CONTEXT ---\n`;

  return basePrompt + contextBlock;
}

export const SLASH_COMMANDS: Record<
  string,
  { prompt: string; descEn: string; descVi: string }
> = {
  '/summary': {
    prompt: 'Summarize the main content of this page into 5 concise, actionable bullet points with key takeaways.',
    descEn: 'Five-bullet summary',
    descVi: 'Tóm tắt 5 gạch đầu dòng',
  },
  '/tldr': {
    prompt: 'Provide a single-sentence TL;DR summary of this entire page.',
    descEn: 'One-line summary',
    descVi: 'Tóm tắt trong 1 câu duy nhất',
  },
  '/explain': {
    prompt: 'Explain the concepts discussed on this page in simple terms with step-by-step clarity.',
    descEn: 'Explain concepts step by step',
    descVi: 'Giải thích đơn giản từng bước',
  },
  '/translate': {
    prompt: 'Translate the main points of this page into Vietnamese (if English) or English (if Vietnamese).',
    descEn: 'Translate page content',
    descVi: 'Dịch nội dung trang',
  },
  '/rewrite': {
    prompt: 'Rewrite the key message of this page in a professional, polished editorial style.',
    descEn: 'Rewrite in polished style',
    descVi: 'Viết lại theo phong cách chuyên nghiệp',
  },
  '/code': {
    prompt: 'Extract and explain all code snippets, APIs, and technical steps mentioned on this page.',
    descEn: 'Extract and explain code snippets',
    descVi: 'Bóc tách và giải thích mã nguồn',
  },
  '/full': {
    prompt: 'Provide a structured, comprehensive summary covering all sections and important details of this page.',
    descEn: 'Full comprehensive summary',
    descVi: 'Tóm tắt đầy đủ toàn bộ nội dung',
  },
};
