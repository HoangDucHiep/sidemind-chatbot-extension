// SideMind · General Fallback Context Pipeline

import { type ContextPipeline, type ExtractInput, type PageContext, type SentenceChunk } from '../types';

export class GeneralPipeline implements ContextPipeline {
  readonly pageType = 'general' as const;

  matches(): boolean {
    return true; // Fallback matches everything
  }

  async extract(input: ExtractInput): Promise<PageContext> {
    const doc = input.document || (typeof document !== 'undefined' ? document : null);
    const title = input.title || doc?.title || 'Webpage';

    if (!doc) {
      return {
        pageType: 'general',
        url: input.url,
        title,
        text: title,
        sentences: [{ id: 1, text: title }],
        status: 'ready',
      };
    }

    try {
      const docClone = doc.cloneNode(true) as Document;

      // Remove obvious non-content elements
      const noise = ['script', 'style', 'noscript', 'iframe', 'svg', 'nav', 'footer'];
      noise.forEach((sel) => {
        docClone.querySelectorAll(sel).forEach((el) => el.remove());
      });

      const bodyText = docClone.body?.innerText || '';
      const paragraphs = bodyText
        .split(/\n\s*\n+/)
        .map((p) => p.replace(/\s+/g, ' ').trim())
        .filter((p) => p.length > 20);

      const sentences: SentenceChunk[] = paragraphs.slice(0, 50).map((p, idx) => ({
        id: idx + 1,
        text: p,
      }));

      const fullText = paragraphs.slice(0, 50).join('\n\n');

      return {
        pageType: 'general',
        url: input.url,
        title,
        text: fullText || title,
        sentences: sentences.length > 0 ? sentences : [{ id: 1, text: title }],
        status: 'ready',
      };
    } catch {
      return {
        pageType: 'general',
        url: input.url,
        title,
        text: title,
        sentences: [{ id: 1, text: title }],
        status: 'ready',
      };
    }
  }
}
