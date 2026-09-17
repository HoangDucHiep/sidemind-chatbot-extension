/* SideMind · i18n dictionary + applyLang()
 * Adds 'translate' attribute semantics:
 *   <span data-i18n-key="sidepanel.title"></span>
 *   <input data-i18n-placeholder="input.placeholder" placeholder="..." />
 * Persistence: localStorage.sidemind_lang ('en' | 'vi')
 */

(function (window) {
  'use strict';

  const DIC = {
    en: {
      // Global
      'global.theme.light': 'Light',
      'global.theme.dark': 'Dark',
      'global.lang.en': 'EN',
      'global.lang.vi': 'VI',
      'global.lang.toggle': 'Language',
      'global.theme.toggle': 'Theme',

      // Landing
      'landing.subtitle': 'Chrome Extension UI Mockups — Editorial / Ink Design Language',
      'landing.tagline': 'No purple gradients. No generic SaaS. Every pixel intentional.',
      'landing.section.title': 'Index',
      'landing.section.count': '10 mockups',
      'landing.footer': 'All mockups reference docs/SRS.md v0.3.0 — design language defined in .cursor/skills/frontend-design/SKILL.md.',
      'landing.coverage': 'FR coverage matrix: 00-design-coverage.md',

      // Card meta
      'card.01.meta': 'FR-01 / FR-03 / FR-05 / FR-11',
      'card.02.meta': 'FR-01 / §3.1.2 SRS',
      'card.03.meta': 'NFR-04 #6',
      'card.04.meta': 'FR-02',
      'card.05.meta': 'FR-08',
      'card.06.meta': 'FR-09',
      'card.07.meta': 'FR-10',
      'card.08.meta': 'FR-06',
      'card.09.meta': 'FR-02 / FR-03 (errors)',

      // Side panel
      'sidepanel.brand': 'SideMind',
      'sidepanel.context.label': 'Context',
      'sidepanel.context.refresh': 'Refresh',
      'sidepanel.context.close': 'Close',
      'sidepanel.context.menu': 'Menu',
      'sidepanel.context.sources': 'Sources',
      'sidepanel.sources.add': '+ Add tab',
      'sidepanel.input.placeholder': 'Ask anything…',
      'sidepanel.input.slashHint': 'Type / for commands',
      'sidepanel.suggested.tldr': '/tldr — one-line summary',
      'sidepanel.suggested.summary': '/summary — five bullets',
      'sidepanel.suggested.explain': '/explain — step by step',
      'sidepanel.suggested.translate': '/translate — to any language',
      'sidepanel.empty.hero': 'Ask about this page.',
      'sidepanel.empty.sub': 'Or run a slash command.',
      'sidepanel.loading.thinking': 'Thinking…',
      'sidepanel.user.q': 'Summarize this video.',
      'sidepanel.ai.response': 'The video walks through three findings.',
      'sidepanel.ai.bullet1': 'Performance improves 40% on baseline hardware.',
      'sidepanel.ai.bullet2': 'Operational cost drops by 25% at scale.',
      'sidepanel.ai.bullet3': 'User-reported satisfaction climbs across cohorts.',
      'sidepanel.action.copy': 'Copy',
      'sidepanel.action.regenerate': 'Regenerate',
      'sidepanel.action.attach': 'Attach files',
      'sidepanel.action.settings': 'Settings',
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
      'fab.state.idle.title': 'Idle',
      'fab.state.hover.title': 'Hover / Drag',
      'fab.state.active.title': 'Active (panel open)',
      'fab.active.note': 'FAB hides when panel is open — FR-01.',
      'fab.viewport.note': 'Mock page background · article view',

      // Onboarding
      'onb.step1.title': 'This is your page context.',
      'onb.step1.body': 'Refresh when the page changes. SideMind re-extracts automatically.',
      'onb.step2.title': 'Ask a question.',
      'onb.step2.body': 'Type a question, or press / for slash commands.',
      'onb.step3.title': 'Settings & history.',
      'onb.step3.body': 'Open the menu to manage API keys, conversation history, and shortcuts.',
      'onb.skip': 'Skip',
      'onb.next': 'Next',
      'onb.done': 'All set!',
      'onb.progress': '%d/%d',

      // API Keys
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
      'keys.btn.show': 'Show',
      'keys.btn.hide': 'Hide',
      'keys.callout.title': 'Encryption guarantee',
      'keys.callout.body': 'All keys are encrypted with AES-GCM-256 before storage. Keys never leave your device except to the AI provider you configure.',
      'keys.saved.toast': 'Encryption complete · key stored',

      // General
      'gen.tab.title': 'General',
      'gen.section.theme': 'Theme',
      'gen.section.model': 'Default model',
      'gen.section.temperature': 'Temperature',
      'gen.section.maxtokens': 'Max tokens',
      'gen.section.fontsize': 'Font size',
      'gen.section.pagemode': 'Default page mode',
      'gen.theme.light': 'Light',
      'gen.theme.dark': 'Dark',
      'gen.theme.auto': 'Auto',
      'gen.model.help': 'Vision-capable models accept images (FR-12).',
      'gen.temperature.help': 'Lower = focused. Higher = creative.',
      'gen.maxtokens.help': 'Cap response length per turn.',
      'gen.fontsize.sm': 'Small',
      'gen.fontsize.md': 'Medium',
      'gen.fontsize.lg': 'Large',
      'gen.pagemode.auto': 'Auto (detect)',
      'gen.pagemode.sum': 'Always summarize',
      'gen.pagemode.full': 'Always full text',
      'gen.btn.discard': 'Discard',
      'gen.btn.save': 'Save',
      'gen.saved.toast': 'Settings saved',

      // Privacy
      'priv.tab.title': 'Privacy',
      'priv.section.telemetry': 'Anonymous usage stats',
      'priv.section.incognito': 'Incognito mode',
      'priv.telemetry.off': 'PRIVATE — OFF (default)',
      'priv.telemetry.on': 'OPT-IN',
      'priv.telemetry.when': 'When enabled, only: extension version, OS, browser version.',
      'priv.telemetry.never': 'No URLs, no page content, no API keys.',
      'priv.incognito.on': 'Allow in Incognito',
      'priv.incognito.off': 'Disable in Incognito (recommended)',
      'priv.incognito.disclaimer': 'When OFF, extension is disabled in incognito windows.',
      'priv.danger.title': 'Danger zone',
      'priv.danger.body': 'This will delete all conversations, cached contexts, and encrypted API keys.',
      'priv.danger.btn': 'Clear all data',
      'priv.clear.confirm.title': 'Delete everything?',
      'priv.clear.confirm.body': 'This cannot be undone.',
      'priv.clear.cancel': 'Cancel',
      'priv.clear.confirm': 'Delete everything',

      // Shortcuts
      'shortcuts.tab.title': 'Shortcuts',
      'shortcuts.customize': 'Customize at chrome://extensions/shortcuts',
      'shortcuts.act.toggle': 'Toggle side panel',
      'shortcuts.act.focus': 'Focus input',
      'shortcuts.act.new': 'New chat',
      'shortcuts.act.copy': 'Copy last AI answer',
      'shortcuts.platform.mac': 'macOS uses ⌘ instead of ⌃',

      // History
      'history.title': 'Conversation History',
      'history.search.placeholder': 'Search title or content…',
      'history.col.updated': 'Updated',
      'history.col.msgs': 'Messages',
      'history.col.tokens': 'Tokens',
      'history.col.actions': 'Actions',
      'history.action.open': 'Open',
      'history.action.export': 'Export',
      'history.action.delete': 'Delete',
      'history.action.tags': 'Tags',
      'history.export.all.md': 'Export all (Markdown)',
      'history.export.all.json': 'Export all (JSON)',
      'history.confirm.delete': 'Delete this conversation?',
      'history.empty': 'No conversations match your search.',

      // Error states
      'err.noKey.title': 'Set up your API key to start.',
      'err.noKey.body': 'SideMind needs at least one valid key to reach an AI provider.',
      'err.noKey.cta': 'Open settings →',
      'err.network.title': 'No connection.',
      'err.network.body': 'SideMind needs internet to reach your AI provider.',
      'err.network.retry': 'Retry',
      'err.quota.title': 'Rate limit reached.',
      'err.quota.body': 'Provider responded with 429. Try again in %d seconds, or rotate the key.',
      'err.extract.title': 'Couldn\'t read this page.',
      'err.extract.body': 'Try refreshing, or open a different article. Use without context as a fallback.',
      'err.extract.cta': 'Use without context',

      // Common
      'common.ready': 'READY',
      'common.extracting': 'EXTRACTING',
      'common.error': 'ERROR',
      'common.cached': 'CACHED',
      'common.saved': 'SAVED',
      'common.you': 'You',
      'common.ai': 'AI',
    },

    vi: {
      // Global
      'global.theme.light': 'Sáng',
      'global.theme.dark': 'Tối',
      'global.lang.en': 'EN',
      'global.lang.vi': 'VI',
      'global.lang.toggle': 'Ngôn ngữ',
      'global.theme.toggle': 'Giao diện',

      // Landing
      'landing.subtitle': 'Chrome Extension UI Mockups — Phong cách Báo chí / Mực',
      'landing.tagline': 'Không gradient tím. Không SaaS generic. Mỗi pixel đều có chủ đích.',
      'landing.section.title': 'Mục lục',
      'landing.section.count': '10 mockup',
      'landing.footer': 'Tất cả mockup tham chiếu docs/SRS.md v0.3.0 — design language định nghĩa tại .cursor/skills/frontend-design/SKILL.md.',
      'landing.coverage': 'Ma trận phủ FR: 00-design-coverage.md',

      // Card meta
      'card.01.meta': 'FR-01 / FR-03 / FR-05 / FR-11',
      'card.02.meta': 'FR-01 / §3.1.2 SRS',
      'card.03.meta': 'NFR-04 #6',
      'card.04.meta': 'FR-02',
      'card.05.meta': 'FR-08',
      'card.06.meta': 'FR-09',
      'card.07.meta': 'FR-10',
      'card.08.meta': 'FR-06',
      'card.09.meta': 'FR-02 / FR-03 (lỗi)',

      // Side panel
      'sidepanel.brand': 'SideMind',
      'sidepanel.context.label': 'Ngữ cảnh',
      'sidepanel.context.refresh': 'Làm mới',
      'sidepanel.context.close': 'Đóng',
      'sidepanel.context.menu': 'Menu',
      'sidepanel.context.sources': 'Nguồn',
      'sidepanel.sources.add': '+ Thêm tab',
      'sidepanel.input.placeholder': 'Hỏi bất kỳ điều gì…',
      'sidepanel.input.slashHint': 'Gõ / để dùng lệnh',
      'sidepanel.suggested.tldr': '/tldr — tóm tắt một dòng',
      'sidepanel.suggested.summary': '/summary — năm ý chính',
      'sidepanel.suggested.explain': '/explain — giải thích từng bước',
      'sidepanel.suggested.translate': '/translate — dịch sang ngôn ngữ khác',
      'sidepanel.empty.hero': 'Hỏi về trang này.',
      'sidepanel.empty.sub': 'Hoặc dùng lệnh slash.',
      'sidepanel.loading.thinking': 'Đang suy nghĩ…',
      'sidepanel.user.q': 'Tóm tắt video này.',
      'sidepanel.ai.response': 'Video trình bày ba phát hiện chính.',
      'sidepanel.ai.bullet1': 'Hiệu suất tăng 40% trên phần cứng cơ sở.',
      'sidepanel.ai.bullet2': 'Chi phí vận hành giảm 25% khi mở rộng quy mô.',
      'sidepanel.ai.bullet3': 'Mức độ hài lòng người dùng tăng qua các nhóm.',
      'sidepanel.action.copy': 'Sao chép',
      'sidepanel.action.regenerate': 'Tạo lại',
      'sidepanel.action.attach': 'Đính kèm',
      'sidepanel.action.settings': 'Cài đặt',
      'sidepanel.streaming.cursor': 'Đang stream',

      // Slash commands
      'slash.summarize': '/summarize',
      'slash.summarize.desc': 'Tóm tắt toàn bài',
      'slash.explain': '/explain',
      'slash.explain.desc': 'Giải thích đoạn chọn',
      'slash.translate': '/translate',
      'slash.translate.desc': 'Dịch trang',
      'slash.rewrite': '/rewrite',
      'slash.rewrite.desc': 'Viết lại theo phong cách khác',
      'slash.code': '/code',
      'slash.code.desc': 'Hỏi về code trong ngữ cảnh',
      'slash.tldr': '/tldr',
      'slash.tldr.desc': 'Tóm tắt một dòng',
      'slash.summary': '/summary',
      'slash.summary.desc': 'Năm ý chính',
      'slash.full': '/full',
      'slash.full.desc': 'Văn bản nguyên xi',

      // FAB
      'fab.open': 'Mở SideMind',
      'fab.drag.hint': 'Kéo để đổi vị trí',
      'fab.drag.saved': 'Đã lưu vị trí',
      'fab.state.idle.title': 'Idle',
      'fab.state.hover.title': 'Hover / Kéo',
      'fab.state.active.title': 'Đang mở (panel open)',
      'fab.active.note': 'FAB tự ẩn khi panel mở — FR-01.',
      'fab.viewport.note': 'Giả lập trang bài báo · article view',

      // Onboarding
      'onb.step1.title': 'Đây là ngữ cảnh trang.',
      'onb.step1.body': 'Làm mới khi trang thay đổi. SideMind tự trích xuất lại.',
      'onb.step2.title': 'Đặt câu hỏi.',
      'onb.step2.body': 'Gõ câu hỏi, hoặc bấm / để mở lệnh.',
      'onb.step3.title': 'Cài đặt & lịch sử.',
      'onb.step3.body': 'Mở menu để quản lý API key, lịch sử và phím tắt.',
      'onb.skip': 'Bỏ qua',
      'onb.next': 'Tiếp',
      'onb.done': 'Xong!',
      'onb.progress': '%d/%d',

      // API Keys
      'keys.tab.title': 'API Keys',
      'keys.tab.subtitle': 'Key không rời máy bạn, ngoại trừ tới AI provider bạn cấu hình.',
      'keys.label.openai': 'OpenAI',
      'keys.label.anthropic': 'Anthropic',
      'keys.label.gemini': 'Gemini',
      'keys.placeholder': 'Dán API key…',
      'keys.status.notset': 'CHƯA CẤU HÌNH',
      'keys.status.valid': 'HỢP LỆ',
      'keys.status.invalid': 'KHÔNG HỢP LỆ',
      'keys.status.testing': 'ĐANG KIỂM TRA…',
      'keys.btn.test': 'Kiểm tra',
      'keys.btn.save': 'Lưu',
      'keys.btn.delete': 'Xoá',
      'keys.btn.show': 'Hiện',
      'keys.btn.hide': 'Ẩn',
      'keys.callout.title': 'Cam kết mã hoá',
      'keys.callout.body': 'Tất cả key được mã hoá AES-GCM-256 trước khi lưu. Key không rời máy bạn ngoài AI provider bạn cấu hình.',
      'keys.saved.toast': 'Đã mã hoá · lưu key xong',

      // General
      'gen.tab.title': 'Chung',
      'gen.section.theme': 'Giao diện',
      'gen.section.model': 'Model mặc định',
      'gen.section.temperature': 'Temperature',
      'gen.section.maxtokens': 'Token tối đa',
      'gen.section.fontsize': 'Cỡ chữ',
      'gen.section.pagemode': 'Chế độ trang mặc định',
      'gen.theme.light': 'Sáng',
      'gen.theme.dark': 'Tối',
      'gen.theme.auto': 'Theo hệ thống',
      'gen.model.help': 'Model có vision chấp nhận ảnh (FR-12).',
      'gen.temperature.help': 'Thấp = tập trung. Cao = sáng tạo.',
      'gen.maxtokens.help': 'Giới hạn độ dài trả lời mỗi turn.',
      'gen.fontsize.sm': 'Nhỏ',
      'gen.fontsize.md': 'Vừa',
      'gen.fontsize.lg': 'Lớn',
      'gen.pagemode.auto': 'Tự động (theo trang)',
      'gen.pagemode.sum': 'Luôn tóm tắt',
      'gen.pagemode.full': 'Luôn nguyên văn',
      'gen.btn.discard': 'Huỷ',
      'gen.btn.save': 'Lưu',
      'gen.saved.toast': 'Đã lưu cài đặt',

      // Privacy
      'priv.tab.title': 'Riêng tư',
      'priv.section.telemetry': 'Thống kê ẩn danh',
      'priv.section.incognito': 'Chế độ ẩn danh',
      'priv.telemetry.off': 'RIÊNG TƯ — TẮT (mặc định)',
      'priv.telemetry.on': 'ĐÃ BẬT',
      'priv.telemetry.when': 'Khi bật, chỉ gửi: phiên bản extension, OS, phiên bản trình duyệt.',
      'priv.telemetry.never': 'Không gửi URL, nội dung trang, hay API key.',
      'priv.incognito.on': 'Cho phép trong ẩn danh',
      'priv.incognito.off': 'Tắt trong ẩn danh (khuyến nghị)',
      'priv.incognito.disclaimer': 'Khi TẮT, extension bị vô hiệu trong cửa sổ ẩn danh.',
      'priv.danger.title': 'Vùng nguy hiểm',
      'priv.danger.body': 'Sẽ xoá tất cả hội thoại, cache ngữ cảnh và API key đã mã hoá.',
      'priv.danger.btn': 'Xoá tất cả dữ liệu',
      'priv.clear.confirm.title': 'Xoá tất cả?',
      'priv.clear.confirm.body': 'Không thể hoàn tác.',
      'priv.clear.cancel': 'Huỷ',
      'priv.clear.confirm': 'Xoá tất cả',

      // Shortcuts
      'shortcuts.tab.title': 'Phím tắt',
      'shortcuts.customize': 'Tuỳ chỉnh tại chrome://extensions/shortcuts',
      'shortcuts.act.toggle': 'Mở / đóng side panel',
      'shortcuts.act.focus': 'Focus vào ô nhập',
      'shortcuts.act.new': 'Hội thoại mới',
      'shortcuts.act.copy': 'Sao chép câu trả lời AI gần nhất',
      'shortcuts.platform.mac': 'macOS dùng ⌘ thay cho ⌃',

      // History
      'history.title': 'Lịch sử hội thoại',
      'history.search.placeholder': 'Tìm tiêu đề hoặc nội dung…',
      'history.col.updated': 'Cập nhật',
      'history.col.msgs': 'Tin nhắn',
      'history.col.tokens': 'Tokens',
      'history.col.actions': 'Thao tác',
      'history.action.open': 'Mở',
      'history.action.export': 'Xuất',
      'history.action.delete': 'Xoá',
      'history.action.tags': 'Tags',
      'history.export.all.md': 'Xuất tất cả (Markdown)',
      'history.export.all.json': 'Xuất tất cả (JSON)',
      'history.confirm.delete': 'Xoá hội thoại này?',
      'history.empty': 'Không có hội thoại nào khớp.',

      // Error states
      'err.noKey.title': 'Hãy cấu hình API key để bắt đầu.',
      'err.noKey.body': 'SideMind cần ít nhất một key hợp lệ để gọi AI provider.',
      'err.noKey.cta': 'Mở cài đặt →',
      'err.network.title': 'Mất kết nối.',
      'err.network.body': 'SideMind cần internet để tới AI provider.',
      'err.network.retry': 'Thử lại',
      'err.quota.title': 'Đã vượt rate limit.',
      'err.quota.body': 'Provider trả 429. Thử lại sau %d giây, hoặc xoay key.',
      'err.extract.title': 'Không đọc được trang này.',
      'err.extract.body': 'Thử tải lại trang, hoặc mở bài khác. Dùng chế độ không có ngữ cảnh.',
      'err.extract.cta': 'Dùng không có ngữ cảnh',

      // Common
      'common.ready': 'SẴN SÀNG',
      'common.extracting': 'ĐANG TRÍCH XUẤT',
      'common.error': 'LỖI',
      'common.cached': 'ĐÃ CACHE',
      'common.saved': 'ĐÃ LƯU',
      'common.you': 'Bạn',
      'common.ai': 'AI',
    },
  };

  function getLang() {
    return localStorage.getItem('sidemind_lang') || 'en';
  }
  function setLang(lang) {
    localStorage.setItem('sidemind_lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    applyLang(lang);
  }

  function t(key, lang) {
    lang = lang || getLang();
    const v = DIC[lang] && DIC[lang][key];
    if (v === undefined) return DIC.en[key] || key;
    return v;
  }

  function applyLang(lang) {
    lang = lang || getLang();
    document.documentElement.setAttribute('data-lang', lang);
    // Update text content
    document.querySelectorAll('[data-i18n-key]').forEach((el) => {
      const key = el.getAttribute('data-i18n-key');
      const val = t(key, lang);
      if (val !== undefined) el.textContent = val;
    });
    // Update attributes
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const spec = el.getAttribute('data-i18n-attr');
      // format: "attr:key"
      const [attr, key] = spec.split(':');
      const val = t(key, lang);
      if (val !== undefined) el.setAttribute(attr, val);
    });
    // Update placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key, lang);
      if (val !== undefined) el.setAttribute('placeholder', val);
    });
    // Update aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      const val = t(key, lang);
      if (val !== undefined) el.setAttribute('aria-label', val);
    });
    // Update title
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      const val = t(key, lang);
      if (val !== undefined) el.setAttribute('title', val);
    });
  }

  // Theme
  function getTheme() {
    return localStorage.getItem('sidemind_theme') || 'light';
  }
  function setTheme(theme) {
    localStorage.setItem('sidemind_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Init on DOMContentLoaded
  function init() {
    setTheme(getTheme());
    setLang(getLang());
  }

  window.SideMind = {
    t,
    applyLang,
    setLang,
    getLang,
    setTheme,
    getTheme,
    init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
