// SideMind · i18n Dictionary & Hooks
// Bilingual support: English (EN) ⇄ Vietnamese (VI)

import { useState, useEffect } from 'react';
import { storage } from './storage';

export type Lang = 'en' | 'vi';

export const DICTIONARY: Record<Lang, Record<string, string>> = {
  en: {
    // Global & Controls
    'global.theme.light': 'Light',
    'global.theme.dark': 'Dark',
    'global.theme.auto': 'Auto',
    'global.lang.en': 'EN',
    'global.lang.vi': 'VI',
    'global.lang.toggle': 'Language',
    'global.theme.toggle': 'Theme',
    'global.save': 'Save',
    'global.cancel': 'Cancel',
    'global.delete': 'Delete',
    'global.close': 'Close',

    // Side panel Header & Context
    'sidepanel.brand': 'SideMind',
    'sidepanel.context.label': 'Context',
    'sidepanel.context.refresh': 'Refresh',
    'sidepanel.context.close': 'Close',
    'sidepanel.context.menu': 'Menu',
    'sidepanel.context.sources': 'Sources',
    'sidepanel.sources.add': '+ Add tab',
    'sidepanel.input.placeholder': 'Ask anything about this page…',
    'sidepanel.input.slashHint': 'Type / for commands',
    'sidepanel.empty.hero': 'Ask about this page.',
    'sidepanel.empty.sub': 'Or run a slash command to summarize, translate, or extract points.',
    'sidepanel.loading.thinking': 'Thinking…',
    'sidepanel.action.copy': 'Copy',
    'sidepanel.action.regenerate': 'Regenerate',
    'sidepanel.action.attach': 'Attach files',
    'sidepanel.action.settings': 'Settings',
    'sidepanel.action.history': 'History',
    'sidepanel.action.newChat': 'New Chat',
    'sidepanel.streaming.cursor': 'Streaming',

    // Slash commands
    'slash.summarize': '/summarize',
    'slash.summarize.desc': 'Full article summary',
    'slash.explain': '/explain',
    'slash.explain.desc': 'Explain selected text',
    'slash.translate': '/translate',
    'slash.translate.desc': 'Translate page',
    'slash.rewrite': '/rewrite',
    'slash.rewrite.desc': 'Rewrite in different style',
    'slash.code': '/code',
    'slash.code.desc': 'Ask about code in context',
    'slash.tldr': '/tldr',
    'slash.tldr.desc': 'One-line summary',
    'slash.summary': '/summary',
    'slash.summary.desc': 'Five-bullet summary',
    'slash.full': '/full',
    'slash.full.desc': 'Raw text verbatim',

    // FAB
    'fab.open': 'Open SideMind',
    'fab.drag.hint': 'Drag to reposition',
    'fab.drag.saved': 'Position saved',

    // Settings & API Keys
    'keys.tab.title': 'API Keys',
    'keys.tab.subtitle': 'Your keys never leave the device except to the AI provider you configure.',
    'keys.label.openai': 'OpenAI',
    'keys.label.anthropic': 'Anthropic',
    'keys.label.gemini': 'Gemini',
    'keys.placeholder': 'Paste API key…',
    'keys.status.notset': 'NOT SET',
    'keys.status.valid': 'VALID',
    'keys.status.invalid': 'INVALID',
    'keys.status.testing': 'TESTING…',
    'keys.btn.test': 'Test',
    'keys.btn.save': 'Save',
    'keys.btn.delete': 'Delete',
    'keys.callout.title': 'Encryption guarantee',
    'keys.callout.body': 'All keys are encrypted with AES-GCM-256 before storage.',

    // History
    'history.title': 'Conversation History',
    'history.search': 'Search history…',
    'history.empty': 'No conversations found',
    'history.clear': 'Clear all history',
  },
  vi: {
    // Global & Controls
    'global.theme.light': 'Sáng',
    'global.theme.dark': 'Tối',
    'global.theme.auto': 'Tự động',
    'global.lang.en': 'EN',
    'global.lang.vi': 'VI',
    'global.lang.toggle': 'Ngôn ngữ',
    'global.theme.toggle': 'Chủ đề',
    'global.save': 'Lưu',
    'global.cancel': 'Huỷ',
    'global.delete': 'Xoá',
    'global.close': 'Đóng',

    // Side panel Header & Context
    'sidepanel.brand': 'SideMind',
    'sidepanel.context.label': 'Ngữ cảnh',
    'sidepanel.context.refresh': 'Làm mới',
    'sidepanel.context.close': 'Đóng',
    'sidepanel.context.menu': 'Menu',
    'sidepanel.context.sources': 'Nguồn',
    'sidepanel.sources.add': '+ Thêm tab',
    'sidepanel.input.placeholder': 'Hỏi bất kỳ điều gì về trang này…',
    'sidepanel.input.slashHint': 'Gõ / để chọn lệnh',
    'sidepanel.empty.hero': 'Hỏi bất cứ điều gì về trang này.',
    'sidepanel.empty.sub': 'Hoặc dùng lệnh slash để tóm tắt, dịch, hoặc trích xuất luận điểm.',
    'sidepanel.loading.thinking': 'Đang suy nghĩ…',
    'sidepanel.action.copy': 'Sao chép',
    'sidepanel.action.regenerate': 'Tạo lại',
    'sidepanel.action.attach': 'Đính kèm tệp',
    'sidepanel.action.settings': 'Cài đặt',
    'sidepanel.action.history': 'Lịch sử',
    'sidepanel.action.newChat': 'Đoạn chat mới',
    'sidepanel.streaming.cursor': 'Đang tải',

    // Slash commands
    'slash.summarize': '/summarize',
    'slash.summarize.desc': 'Tóm tắt toàn bộ bài viết',
    'slash.explain': '/explain',
    'slash.explain.desc': 'Giải thích đoạn văn bản đã chọn',
    'slash.translate': '/translate',
    'slash.translate.desc': 'Dịch trang sang ngôn ngữ khác',
    'slash.rewrite': '/rewrite',
    'slash.rewrite.desc': 'Viết lại theo phong cách khác',
    'slash.code': '/code',
    'slash.code.desc': 'Hỏi về đoạn mã trong ngữ cảnh',
    'slash.tldr': '/tldr',
    'slash.tldr.desc': 'Tóm tắt 1 câu',
    'slash.summary': '/summary',
    'slash.summary.desc': 'Tóm tắt 5 gạch đầu dòng',
    'slash.full': '/full',
    'slash.full.desc': 'Toàn bộ nội dung nguyên bản',

    // FAB
    'fab.open': 'Mở SideMind',
    'fab.drag.hint': 'Kéo để đổi vị trí',
    'fab.drag.saved': 'Đã lưu vị trí',

    // Settings & API Keys
    'keys.tab.title': 'Khoá API',
    'keys.tab.subtitle': 'Khoá của bạn không bao giờ rời khỏi thiết bị ngoại trừ gửi tới nhà cung cấp AI.',
    'keys.label.openai': 'OpenAI',
    'keys.label.anthropic': 'Anthropic',
    'keys.label.gemini': 'Gemini',
    'keys.placeholder': 'Dán khoá API…',
    'keys.status.notset': 'CHƯA ĐẶT',
    'keys.status.valid': 'HỢP LỆ',
    'keys.status.invalid': 'KHÔNG HỢP LỆ',
    'keys.status.testing': 'ĐANG KIỂM TRA…',
    'keys.btn.test': 'Kiểm tra',
    'keys.btn.save': 'Lưu',
    'keys.btn.delete': 'Xoá',
    'keys.callout.title': 'Cam kết bảo mật',
    'keys.callout.body': 'Mọi khoá API đều được mã hoá bằng AES-GCM-256 trước khi lưu.',

    // History
    'history.title': 'Lịch sử cuộc trò chuyện',
    'history.search': 'Tìm kiếm lịch sử…',
    'history.empty': 'Chưa có cuộc trò chuyện nào',
    'history.clear': 'Xoá toàn bộ lịch sử',
  },
};

let currentLang: Lang = 'en';

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  currentLang = lang;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
  }
  storage.set('sidemind_lang', lang);
}

export function t(key: string, defaultText?: string): string {
  return DICTIONARY[currentLang]?.[key] ?? DICTIONARY['en']?.[key] ?? defaultText ?? key;
}

export function useI18n() {
  const [lang, setLangState] = useState<Lang>(currentLang);

  useEffect(() => {
    storage.get('sidemind_lang').then((saved) => {
      if (saved && (saved === 'en' || saved === 'vi')) {
        currentLang = saved;
        setLangState(saved);
        document.documentElement.setAttribute('lang', saved);
        document.documentElement.setAttribute('data-lang', saved);
      }
    });

    return storage.watch('sidemind_lang', (newLang) => {
      if (newLang && (newLang === 'en' || newLang === 'vi')) {
        currentLang = newLang;
        setLangState(newLang);
        document.documentElement.setAttribute('lang', newLang);
        document.documentElement.setAttribute('data-lang', newLang);
      }
    });
  }, []);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    setLangState(newLang);
  };

  return {
    lang,
    setLang: changeLang,
    t: (key: string, defaultText?: string) =>
      DICTIONARY[lang]?.[key] ?? DICTIONARY['en']?.[key] ?? defaultText ?? key,
  };
}
