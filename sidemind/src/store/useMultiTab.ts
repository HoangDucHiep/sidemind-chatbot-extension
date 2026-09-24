// SideMind · Multi-Tab Context Types & State Store (FR-11)

import { create } from 'zustand';
import { type PageContext } from '../lib/context/types';

export interface TabSource {
  tabId: number;
  title: string;
  url: string;
  favIconUrl?: string;
  status: 'extracting' | 'ready' | 'error';
  context?: PageContext;
  error?: string;
}

interface MultiTabState {
  sources: TabSource[];
  isSelectorOpen: boolean;
  setSelectorOpen: (open: boolean) => void;
  addTab: (tab: chrome.tabs.Tab) => Promise<void>;
  removeTab: (tabId: number) => void;
  clearTabs: () => void;
  extractTabContext: (tabId: number, url: string, title: string) => Promise<void>;
}

export const useMultiTabStore = create<MultiTabState>((set, get) => ({
  sources: [],
  isSelectorOpen: false,

  setSelectorOpen: (open: boolean) => set({ isSelectorOpen: open }),

  addTab: async (tab: chrome.tabs.Tab) => {
    if (!tab.id) return;
    const existing = get().sources.find((s) => s.tabId === tab.id);
    if (existing) return;

    const newSource: TabSource = {
      tabId: tab.id,
      title: tab.title || 'Untitled Tab',
      url: tab.url || '',
      favIconUrl: tab.favIconUrl,
      status: 'extracting',
    };

    set((state) => ({ sources: [...state.sources, newSource] }));
    await get().extractTabContext(tab.id, tab.url || '', tab.title || '');
  },

  removeTab: (tabId: number) => {
    set((state) => ({ sources: state.sources.filter((s) => s.tabId !== tabId) }));
  },

  clearTabs: () => {
    set({ sources: [] });
  },

  extractTabContext: async (tabId: number, url: string, title: string) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs?.sendMessage) {
        const res = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_CONTEXT' }).catch(() => null);
        if (res && res.context) {
          set((state) => ({
            sources: state.sources.map((s) =>
              s.tabId === tabId ? { ...s, status: 'ready', context: res.context } : s
            ),
          }));
          return;
        }
      }

      // Fallback: minimal context using title & url
      const fallbackContext: PageContext = {
        pageType: 'general',
        url,
        title,
        text: `Page Title: ${title}\nURL: ${url}`,
        sentences: [{ id: 1, text: title }],
        status: 'ready',
      };

      set((state) => ({
        sources: state.sources.map((s) =>
          s.tabId === tabId ? { ...s, status: 'ready', context: fallbackContext } : s
        ),
      }));
    } catch (err) {
      set((state) => ({
        sources: state.sources.map((s) =>
          s.tabId === tabId ? { ...s, status: 'error', error: String(err) } : s
        ),
      }));
    }
  },
}));
