// SideMind · Article Context Pipeline (Readability.js + Noise Filter)

import { Readability } from '@mozilla/readability';
import { type ContextPipeline, type ExtractInput, type PageContext, type SentenceChunk } from '../types';

export class ArticlePipeline implements ContextPipeline {
  readonly pageType = 'article' as const;

  matches(url: string, doc?: Document): boolean {
    if (doc) {
      const ogType = doc.querySelector('meta[property="og:type"]')?.getAttribute('content');
      if (ogType === 'article') return true;
      if (doc.querySelector('article, [role="article"]')) return true;
    }
    return !url.includes('youtube.com') && !url.endsWith('.pdf');
  }

  async extract(input: ExtractInput): Promise<PageContext> {
    const doc = input.document || (typeof document !== 'undefined' ? document : null);
    const title = input.title || doc?.title || 'Article';

    if (!doc) {
      return {
        pageType: 'article',
        url: input.url,
        title,
        text: title,
        sentences: [{ id: 1, text: title }],
        status: 'error',
        error: 'No document DOM available for article extraction.',
      };
    }

    try {
      // Clone document to avoid modifying original page DOM
      const docClone = doc.cloneNode(true) as Document;

      // Remove noise: cookie banners, social share bars, comment sections
      const noiseSelectors = [
        '#comments',
        '.comments',
        '.comment-section',
        '.disqus',
        '.cookie-banner',
        '.social-share',
        '.share-buttons',
        '.related-articles',
        'nav',
        'footer',
        'header',
      ];
      noiseSelectors.forEach((sel) => {
        docClone.querySelectorAll(sel).forEach((el) => el.remove());
      });

      const reader = new Readability(docClone, { charThreshold: 40 });
      const parsed = reader.parse();

      if (parsed && parsed.textContent && parsed.textContent.trim().length > 100) {
        const rawText = parsed.textContent.trim();
        // Split text by paragraphs / sentences
        const rawParagraphs = rawText
          .split(/\n\s*\n+/)
          .map((p) => p.replace(/\s+/g, ' ').trim())
          .filter((p) => p.length > 20);

        const sentences: SentenceChunk[] = rawParagraphs.map((p, idx) => ({
          id: idx + 1,
          text: p,
        }));

        return {
          pageType: 'article',
          url: input.url,
          title: parsed.title || title,
          text: rawText,
          sentences: sentences.length > 0 ? sentences : [{ id: 1, text: rawText }],
          metadata: {
            author: parsed.byline || undefined,
            publishedDate: parsed.publishedTime || undefined,
          },
          status: 'ready',
        };
      }
    } catch {
      // Fallback
    }

    // Fallback: extract main text from body
    const bodyText = doc.body?.innerText?.trim() || title;
    return {
      pageType: 'article',
      url: input.url,
      title,
      text: bodyText.slice(0, 10000),
      sentences: [{ id: 1, text: bodyText.slice(0, 1000) }],
      status: 'ready',
    };
  }
}
