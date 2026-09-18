// SideMind · Context Classifier (URL + DOM Heuristics)

import { type PageType } from './types';

const DOCS_DOMAINS = [
  'docs.python.org',
  'developer.mozilla.org',
  'devdocs.io',
  'react.dev',
  'nodejs.org/docs',
  'wxt.dev',
  'github.com',
  'gitlab.com',
  'stackoverflow.com',
  'typescriptlang.org/docs',
];

export function classifyPageType(url: string, doc?: Document): PageType {
  const cleanUrl = url.toLowerCase();

  // 1. YouTube
  if (cleanUrl.includes('youtube.com/watch') || cleanUrl.includes('youtu.be/')) {
    return 'youtube';
  }

  // 2. PDF
  if (
    cleanUrl.endsWith('.pdf') ||
    cleanUrl.includes('.pdf?') ||
    doc?.contentType === 'application/pdf'
  ) {
    return 'pdf';
  }

  // 3. Technical Docs
  if (DOCS_DOMAINS.some((domain) => cleanUrl.includes(domain))) {
    return 'docs';
  }

  if (doc) {
    // Check code density
    const codeTags = doc.querySelectorAll('pre, code');
    if (codeTags.length > 5) {
      return 'docs';
    }

    // 4. Article (Schema.org or OpenGraph type)
    const ogType = doc.querySelector('meta[property="og:type"]')?.getAttribute('content');
    if (ogType === 'article') {
      return 'article';
    }

    const articleTag = doc.querySelector('article, [itemtype*="Article"], [role="article"]');
    if (articleTag) {
      return 'article';
    }
  }

  // 5. Fallback General
  return 'general';
}
