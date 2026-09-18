// SideMind · Context Engine Types

export type PageType = 'youtube' | 'article' | 'pdf' | 'docs' | 'general';

export interface SentenceChunk {
  id: number;
  text: string;
  pageNumber?: number;
  timestamp?: number; // In seconds (for YouTube)
  timestampStr?: string; // Formatted "MM:SS" (for YouTube)
}

export interface PageContext {
  pageType: PageType;
  url: string;
  title: string;
  text: string;
  sentences: SentenceChunk[];
  metadata?: {
    author?: string;
    publishedDate?: string;
    videoId?: string;
    totalPages?: number;
    description?: string;
  };
  status: 'ready' | 'error';
  error?: string;
}

export interface ExtractInput {
  url: string;
  title?: string;
  document?: Document;
  htmlContent?: string;
  binaryBuffer?: ArrayBuffer;
}

export interface ContextPipeline {
  readonly pageType: PageType;
  matches(url: string, document?: Document): boolean;
  extract(input: ExtractInput): Promise<PageContext>;
}
