// SideMind · Technical Docs Context Pipeline

import { type ContextPipeline, type ExtractInput, type PageContext, type SentenceChunk } from '../types';

export class DocsPipeline implements ContextPipeline {
  readonly pageType = 'docs' as const;

  matches(url: string, doc?: Document): boolean {
    const cleanUrl = url.toLowerCase();
    if (
      cleanUrl.includes('developer.mozilla.org') ||
      cleanUrl.includes('docs.python.org') ||
      cleanUrl.includes('react.dev') ||
      cleanUrl.includes('devdocs.io') ||
      cleanUrl.includes('wxt.dev')
    ) {
      return true;
    }
    if (doc) {
      const codeCount = doc.querySelectorAll('pre, code').length;
      if (codeCount > 5) return true;
    }
    return false;
  }

  async extract(input: ExtractInput): Promise<PageContext> {
    const doc = input.document || (typeof document !== 'undefined' ? document : null);
    const title = input.title || doc?.title || 'Technical Documentation';

    if (!doc) {
      return {
        pageType: 'docs',
        url: input.url,
        title,
        text: title,
        sentences: [{ id: 1, text: title }],
        status: 'error',
        error: 'No document DOM available for docs extraction.',
      };
    }

    try {
      const docClone = doc.cloneNode(true) as Document;

      // Strip navbars, sidebars, footers, search boxes
      const noise = ['nav', 'header', 'footer', '.sidebar', '#sidebar', '.toc', '.search-box', '.menu'];
      noise.forEach((sel) => {
        docClone.querySelectorAll(sel).forEach((el) => el.remove());
      });

      // Target main content area
      const mainElement =
        docClone.querySelector('main, article, #content, .content, .main, [role="main"]') ||
        docClone.body;

      // Extract sections by headings
      const headingsAndBlocks = mainElement.querySelectorAll(
        'h1, h2, h3, h4, p, pre, table, ul, ol'
      );
      const sentences: SentenceChunk[] = [];
      let fullText = '';
      let chunkId = 1;

      headingsAndBlocks.forEach((el) => {
        const tag = el.tagName.toLowerCase();
        let content = '';

        if (tag === 'pre') {
          content = `\n\`\`\`\n${el.textContent || ''}\n\`\`\`\n`;
        } else if (tag.startsWith('h')) {
          content = `\n### ${el.textContent?.trim()}\n`;
        } else {
          content = el.textContent?.trim() || '';
        }

        if (content.trim().length > 10) {
          sentences.push({
            id: chunkId++,
            text: content.trim(),
          });
          fullText += `${content}\n\n`;
        }
      });

      if (sentences.length > 0) {
        return {
          pageType: 'docs',
          url: input.url,
          title,
          text: fullText.trim(),
          sentences,
          status: 'ready',
        };
      }
    } catch {
      // Fallback
    }

    const fallbackText = doc.body?.innerText?.trim() || title;
    return {
      pageType: 'docs',
      url: input.url,
      title,
      text: fallbackText.slice(0, 15000),
      sentences: [{ id: 1, text: fallbackText.slice(0, 1000) }],
      status: 'ready',
    };
  }
}
