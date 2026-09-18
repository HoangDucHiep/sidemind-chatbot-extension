// SideMind · chrome.storage Wrapper
// Type-safe persistence for settings, history, and session state

export interface StorageSchema {
  // Settings & preferences (chrome.storage.local)
  sidemind_theme: 'light' | 'dark' | 'auto';
  sidemind_lang: 'en' | 'vi';
  sidemind_active_model: string;
  sidemind_active_provider: 'openai' | 'anthropic' | 'gemini';
  sidemind_temperature: number;
  sidemind_max_tokens: number;
  sidemind_font_size: 'sm' | 'md' | 'lg';
  sidemind_fab_position: { x: number; y: number } | null;
  sidemind_onboarding_completed: boolean;
  sidemind_telemetry_enabled: boolean;

  // Encrypted API keys
  sidemind_keys_encrypted: {
    openai?: string;
    anthropic?: string;
    gemini?: string;
    salt?: string;
    iv?: string;
  };

  // Conversation history metadata index (lightweight)
  sidemind_history_index: Array<{
    id: string;
    title: string;
    timestamp: number;
    model: string;
    tags: string[];
    messageCount: number;
  }>;
}

export type StorageKey = keyof StorageSchema;

export const storage = {
  async get<K extends StorageKey>(key: K): Promise<StorageSchema[K] | undefined> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const res = await chrome.storage.local.get(key);
      return res[key] as StorageSchema[K] | undefined;
    }
    // Fallback to localStorage in non-extension environments (e.g. dev mockups)
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  },

  async set<K extends StorageKey>(key: K, value: StorageSchema[K]): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [key]: value });
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('Storage set error:', err);
    }
  },

  async remove<K extends StorageKey>(key: K): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.remove(key);
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn('Storage remove error:', err);
    }
  },

  async clear(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.clear();
      return;
    }
    try {
      localStorage.clear();
    } catch (err) {
      console.warn('Storage clear error:', err);
    }
  },

  // Watch key changes
  watch<K extends StorageKey>(key: K, callback: (newVal: StorageSchema[K] | undefined) => void): () => void {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
        if (area === 'local' && changes[key]) {
          callback(changes[key].newValue as StorageSchema[K]);
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
    return () => {};
  },
};
