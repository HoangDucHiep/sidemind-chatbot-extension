// SideMind · Conversation History Management (CRUD + LRU 1000)

import { storage } from "./storage";
import { type ChatMessage } from "../store/useChat";
import { type AiProvider } from "./ai/types";

export interface ConversationMeta {
  id: string;
  title: string;
  timestamp: number;
  model: string;
  provider: AiProvider;
  pageUrl?: string;
  pageType?: string;
  tags: string[];
  messageCount: number;
}

export interface Conversation extends ConversationMeta {
  messages: ChatMessage[];
}

const MAX_HISTORY_ITEMS = 1000;

const memoryConvoStore: Record<string, string> = {};

export const historyService = {
  async getList(): Promise<ConversationMeta[]> {
    const list = await storage.get("sidemind_history_index");
    return (list as ConversationMeta[]) || [];
  },

  async getById(id: string): Promise<Conversation | null> {
    const convoKey = `sidemind_convo_${id}`;
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      const res = await chrome.storage.local.get(convoKey);
      return (res[convoKey] as Conversation) || null;
    }
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(convoKey);
        return raw ? JSON.parse(raw) : null;
      }
      const raw = memoryConvoStore[convoKey];
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async getAll(): Promise<Conversation[]> {
    const list = await this.getList();
    const results: Conversation[] = [];
    for (const meta of list) {
      const full = await this.getById(meta.id);
      if (full) results.push(full);
    }
    return results;
  },

  async save(convo: Conversation): Promise<void> {
    const list = await this.getList();

    // Prepare metadata item
    const meta: ConversationMeta = {
      id: convo.id,
      title: convo.title || "New Conversation",
      timestamp: convo.timestamp || Date.now(),
      model: convo.model,
      provider: convo.provider,
      pageUrl: convo.pageUrl,
      pageType: convo.pageType,
      tags: convo.tags || [],
      messageCount: convo.messages.length,
    };

    // Remove existing if updating, place at front (LRU)
    const filtered = list.filter((item) => item.id !== convo.id);
    const updatedList = [meta, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    // Save full conversation item
    const convoKey = `sidemind_convo_${convo.id}`;
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.set({ [convoKey]: convo });
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(convoKey, JSON.stringify(convo));
    } else {
      memoryConvoStore[convoKey] = JSON.stringify(convo);
    }

    // Save metadata index
    await storage.set("sidemind_history_index", updatedList as any);
  },

  async delete(id: string): Promise<void> {
    const list = await this.getList();
    const updated = list.filter((item) => item.id !== id);
    await storage.set("sidemind_history_index", updated as any);

    const convoKey = `sidemind_convo_${id}`;
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.remove(convoKey);
    } else if (typeof localStorage !== "undefined") {
      localStorage.removeItem(convoKey);
    } else {
      delete memoryConvoStore[convoKey];
    }
  },

  async clearAll(): Promise<void> {
    const list = await this.getList();
    const keysToRemove = list.map((item) => `sidemind_convo_${item.id}`);

    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      await chrome.storage.local.remove(keysToRemove);
    } else if (typeof localStorage !== "undefined") {
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } else {
      keysToRemove.forEach((k) => delete memoryConvoStore[k]);
    }

    await storage.set("sidemind_history_index", []);
  },

  async search(query: string): Promise<ConversationMeta[]> {
    const list = await this.getList();
    const q = query.toLowerCase().trim();
    if (!q) return list;

    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)),
    );
  },
};
