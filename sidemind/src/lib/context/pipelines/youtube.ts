// SideMind · YouTube Context Pipeline

import { type ContextPipeline, type ExtractInput, type PageContext, type SentenceChunk } from '../types';

function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/shorts\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export class YouTubePipeline implements ContextPipeline {
  readonly pageType = 'youtube' as const;

  matches(url: string): boolean {
    return url.includes('youtube.com/watch') || url.includes('youtu.be/');
  }

  async extract(input: ExtractInput): Promise<PageContext> {
    const videoId = extractYouTubeVideoId(input.url);
    const title = input.title || input.document?.title || 'YouTube Video';

    if (!videoId) {
      return {
        pageType: 'youtube',
        url: input.url,
        title,
        text: title,
        sentences: [{ id: 1, text: title }],
        status: 'error',
        error: 'Cannot extract YouTube video ID from URL.',
      };
    }

    try {
      // 1. Fetch timedtext caption track list
      const listUrl = `https://www.youtube.com/api/timedtext?type=list&v=${videoId}`;
      const listRes = await fetch(listUrl);
      const listXml = await listRes.text();

      // Look for lang_code attribute
      const langMatch = listXml.match(/lang_code="([^"]+)"/);
      const trackLang = langMatch ? langMatch[1] : 'en';

      // 2. Fetch json3 transcript
      const transcriptUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${trackLang}&fmt=json3`;
      const transRes = await fetch(transcriptUrl);

      if (transRes.ok) {
        const transData = await transRes.json();
        const events = transData.events || [];

        const sentences: SentenceChunk[] = [];
        let fullText = '';
        let chunkIndex = 1;

        // Group dialogue cues into 10-15s paragraphs
        let currentText = '';
        let currentStart = 0;

        for (const ev of events) {
          if (!ev.segs) continue;
          const text = ev.segs.map((s: { utf8?: string }) => s.utf8 || '').join('').trim();
          if (!text || text === '\n') continue;

          const startSec = (ev.tStartMs || 0) / 1000;

          if (!currentText) {
            currentStart = startSec;
            currentText = text;
          } else if (startSec - currentStart < 15) {
            currentText += ' ' + text;
          } else {
            sentences.push({
              id: chunkIndex++,
              text: currentText,
              timestamp: currentStart,
              timestampStr: formatTimestamp(currentStart),
            });
            fullText += `[${formatTimestamp(currentStart)}] ${currentText}\n\n`;
            currentStart = startSec;
            currentText = text;
          }
        }

        if (currentText) {
          sentences.push({
            id: chunkIndex++,
            text: currentText,
            timestamp: currentStart,
            timestampStr: formatTimestamp(currentStart),
          });
          fullText += `[${formatTimestamp(currentStart)}] ${currentText}\n\n`;
        }

        if (sentences.length > 0) {
          return {
            pageType: 'youtube',
            url: input.url,
            title,
            text: fullText.trim(),
            sentences,
            metadata: { videoId },
            status: 'ready',
          };
        }
      }
    } catch {
      // Fallback below
    }

    // Fallback: Use page metadata og:title + og:description
    const desc =
      input.document?.querySelector('meta[name="description"]')?.getAttribute('content') ||
      input.document?.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
      '';

    const fallbackText = `${title}\n\n${desc}`.trim();
    return {
      pageType: 'youtube',
      url: input.url,
      title,
      text: fallbackText,
      sentences: [{ id: 1, text: fallbackText }],
      metadata: { videoId, description: desc },
      status: 'ready',
    };
  }
}
