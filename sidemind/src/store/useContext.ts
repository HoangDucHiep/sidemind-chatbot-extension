// SideMind · Context State Store (Zustand)

import { create } from 'zustand';
import { type PageContext } from '../lib/context/types';
import { contextEngine } from '../lib/context/engine';

interface ContextState {
  tabId: number | null;
  url: string;
  title: string;
  context: PageContext | null;
  isLoading: boolean;
  error: string | null;

  refreshContext: () => Promise<void>;
  setManualContext: (ctx: PageContext) => void;
}

export const useContextStore = create<ContextState>((set) => ({
  tabId: null,
  url: '',
  title: 'Current Webpage',
  context: null,
  isLoading: false,
  error: null,

  refreshContext: async () => {
    set({ isLoading: true, error: null });

    try {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        // Fallback in dev/mock environment
        const fallback = await contextEngine.extract({
          url: window.location.href,
          title: document.title,
          document,
        });
        set({ context: fallback, isLoading: false, url: window.location.href, title: document.title });
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        set({ isLoading: false, error: 'No active tab found' });
        return;
      }

      const tabId = tab.id;
      const tabUrl = tab.url || '';
      const tabTitle = tab.title || 'Untitled Page';

      set({ tabId, url: tabUrl, title: tabTitle });

      // Request page DOM from content script
      let pageHtml = '';
      try {
        const response = await chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_CONTENT' });
        if (response && response.html) {
          pageHtml = response.html;
        }
      } catch {
        // Content script might not be injected yet
      }

      // Parse with DOMParser if html received
      let doc: Document | undefined;
      if (pageHtml) {
        const parser = new DOMParser();
        doc = parser.parseFromString(pageHtml, 'text/html');
      }

      const extracted = await contextEngine.extract({
        url: tabUrl,
        title: tabTitle,
        document: doc,
        htmlContent: pageHtml,
      });

      set({
        context: extracted,
        isLoading: false,
        title: extracted.title || tabTitle,
        error: extracted.status === 'error' ? extracted.error : null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  setManualContext: (ctx: PageContext) => {
    set({ context: ctx, title: ctx.title, url: ctx.url });
  },
}));
