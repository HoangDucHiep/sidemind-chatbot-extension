// SideMind · Context Engine Orchestrator

import { classifyPageType } from './classifier';
import { type ContextPipeline, type ExtractInput, type PageContext, type PageType } from './types';
import { YouTubePipeline } from './pipelines/youtube';
import { ArticlePipeline } from './pipelines/article';
import { PDFPipeline } from './pipelines/pdf';
import { DocsPipeline } from './pipelines/docs';
import { GeneralPipeline } from './pipelines/general';

export class ContextEngine {
  private pipelines: Record<PageType, ContextPipeline> = {
    youtube: new YouTubePipeline(),
    article: new ArticlePipeline(),
    pdf: new PDFPipeline(),
    docs: new DocsPipeline(),
    general: new GeneralPipeline(),
  };

  async extract(input: ExtractInput): Promise<PageContext> {
    const pageType = classifyPageType(input.url, input.document);
    const pipeline = this.pipelines[pageType] || this.pipelines.general;
    return await pipeline.extract(input);
  }
}

export const contextEngine = new ContextEngine();

export * from './types';
export * from './classifier';
export * from './prompts';
