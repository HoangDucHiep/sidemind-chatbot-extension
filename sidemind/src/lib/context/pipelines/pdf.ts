// SideMind · PDF Context Pipeline (pdfjs-dist)

import * as pdfjsLib from 'pdfjs-dist';
import { type ContextPipeline, type ExtractInput, type PageContext, type SentenceChunk } from '../types';

export class PDFPipeline implements ContextPipeline {
  readonly pageType = 'pdf' as const;

  matches(url: string, doc?: Document): boolean {
    return (
      url.endsWith('.pdf') ||
      url.includes('.pdf?') ||
      doc?.contentType === 'application/pdf'
    );
  }

  async extract(input: ExtractInput): Promise<PageContext> {
    const title = input.title || 'PDF Document';

    try {
      let buffer = input.binaryBuffer;

      // If buffer not passed directly, fetch binary from URL
      if (!buffer && input.url) {
        const res = await fetch(input.url);
        buffer = await res.arrayBuffer();
      }

      if (!buffer) {
        return {
          pageType: 'pdf',
          url: input.url,
          title,
          text: title,
          sentences: [{ id: 1, text: title }],
          status: 'error',
          error: 'Could not load PDF binary data.',
        };
      }

      // Load PDF using pdfjs
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;

      const sentences: SentenceChunk[] = [];
      let fullText = '';
      let chunkId = 1;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (pageText) {
          sentences.push({
            id: chunkId++,
            text: pageText,
            pageNumber: pageNum,
          });
          fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`;
        }
      }

      return {
        pageType: 'pdf',
        url: input.url,
        title,
        text: fullText.trim(),
        sentences,
        metadata: {
          totalPages: pdf.numPages,
        },
        status: 'ready',
      };
    } catch (err) {
      return {
        pageType: 'pdf',
        url: input.url,
        title,
        text: title,
        sentences: [{ id: 1, text: title }],
        status: 'error',
        error: `Failed to parse PDF: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }
}
