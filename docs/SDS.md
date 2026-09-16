# Software Design Specification (SDS)
## SideMind — Chrome Extension Chat Sidebar

| | |
|---|---|
| **Phiên bản** | 0.1.0 (Skeleton — chờ SRS review) |
| **Ngày** | 2026-09-16 |
| **Tác giả** | Nhóm đồ án cuối kỳ — môn học UDDN |
| **Chuẩn** | IEEE Std 1016-2009 (Skeleton) |
| **Tài liệu tham chiếu** | [SRS.md](./SRS.md) |

---

## Ghi chú quan trọng

Tài liệu này là **skeleton** của SDS, được tạo song song với SRS theo yêu cầu của người dùng. Mục đích:

- Đảm bảo **SDS có thể tham chiếu chéo tới SRS** thông qua các ID ổn định (FR-xx, NFR-xx).
- **Tái sử dụng diagrams** từ SRS (các Hình đã được đánh số ở SRS sẽ giữ nguyên số khi trích sang SDS).
- Chuẩn bị **khung chương** để phase tiếp theo có thể viết nội dung chi tiết (kiến trúc, class diagram, data dictionary, deployment view).

**Nội dung chi tiết** của từng section sẽ được viết đầy đủ **sau khi SRS được review và duyệt**, để tránh thiết kế trước khi requirements đã ổn định.

---

## Mục lục

1. [Introduction](#1-introduction)
2. [Architectural Design](#2-architectural-design)
3. [Data Design](#3-data-design)
4. [Component Design](#4-component-design)
5. [Interface Design](#5-interface-design)
6. [Human-Machine Interface Design](#6-human-machine-interface-design)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose

Tài liệu này mô tả thiết kế phần mềm (Software Design Specification) cho **SideMind** — Chrome Extension chat sidebar với context-awareness vượt trội. SDS này là **đầu ra** của quá trình thiết kế, lấy **đầu vào** từ [SRS.md](./SRS.md).

### 1.2 Scope

SDS mô tả:

- Kiến trúc tổng thể của hệ thống (MV3 components).
- Thiết kế dữ liệu (storage schema, ER diagram — tham chiếu SRS Hình 6).
- Thiết kế từng module (Context Engine, Citation Manager, Crypto, AI Adapter).
- Thiết kế giao diện người dùng (Side Panel, FAB, Options Page).
- Mapping giữa requirements (FR-xx, NFR-xx) và components.

### 1.3 References

| Tài liệu | Mô tả |
|---|---|
| [SRS.md](./SRS.md) | Software Requirements Specification — đầu vào của SDS |
| IEEE Std 1016-2009 | Standard for Information Technology — Systems Design |
| Chrome Extension MV3 docs | Kiến trúc Service Worker, Content Script, Side Panel |
| OpenAI / Anthropic / Gemini API | API contracts cho từng provider |

### 1.4 Glossary

Xem [SRS.md §1.3](./SRS.md#13-definitions-acronyms-abbreviations).

---

## 2. Architectural Design

### 2.1 Kiến trúc tổng thể

> **Diagrams tham chiếu từ SRS**: [Hình 2 — Component Architecture](./SRS.md#35-software-system-attributes), [Hình 5 — State Machine](./SRS.md#34-state-machine--context-extraction).

Hệ thống tuân theo kiến trúc **Chrome MV3 extension** với 4 thành phần chính:

| Component | Vai trò | Trách nhiệm |
|---|---|---|
| **Service Worker** | Background orchestrator | Quản lý message routing, AI API calls, storage, crypto, streaming response |
| **Content Script** | Page context bridge | Inject FAB, trích xuất context, highlight citation |
| **Side Panel (React App)** | Primary UI | Chat interface, conversation list, quick actions |
| **Options Page** | Settings UI | API key management, preferences, privacy controls |

### 2.2 Module Breakdown (placeholder — sẽ chi tiết ở Section 4)

| Module | Reference SRS | Mô tả ngắn |
|---|---|---|
| `ContextEngine` | FR-04 | Trích xuất main content, phân loại page type, normalize |
| `CitationManager` | FR-05 | Map AI answer ↔ source sentence, highlight cross-context |
| `CryptoModule` | FR-02, NFR-02 | AES-GCM encryption cho API key |
| `AIAdapter` | FR-03 | Adapter pattern cho OpenAI / Anthropic / Gemini |
| `HistoryManager` | FR-06 | Lưu trữ + search conversation history |
| `SettingsManager` | FR-08 | Đọc/ghi user preferences |
| `FABController` | FR-01 | Quản lý FAB injection và position |
| `KeyboardShortcutManager` | FR-10 | Đăng ký và xử lý `chrome.commands` |

### 2.3 Luồng xử lý chính

> **Diagram tham chiếu từ SRS**: [Hình 3 — Sequence Chat + Citation](./SRS.md#3202-sequence-diagram--chat-with-citation-flow).

*(Sẽ viết chi tiết ở phase sau — sequence cho từng use case chính: Chat, Extract Context, Encrypt Key, Cite, History Search.)*

### 2.4 Kiến trúc phi chức năng

> **Tham chiếu**: SRS §3.3 (NFR-01 đến NFR-07).

| Concern | Approach | Reference |
|---|---|---|
| Performance | Lazy-load modules; cache context trong IndexedDB; debounce highlight | NFR-01 |
| Security | AES-GCM-256; CSP strict; DOMPurify cho markdown | NFR-02 |
| Reliability | Exponential backoff retry; persist state qua `chrome.storage.session` | NFR-03 |
| Maintainability | Module hóa; adapter pattern; TypeScript strict | NFR-06 |
| i18n | `_locales/<lang>/messages.json`; react-i18next | NFR-04 |

---

## 3. Data Design

### 3.1 Storage Schema

> **Diagram tham chiếu từ SRS**: [Hình 6 — Storage ER Diagram](./SRS.md#3121-storage-schema-mermaid-er-diagram).

*(Phần này sẽ mở rộng chi tiết ở phase sau:*

- *Định nghĩa TypeScript interface cho mỗi entity.*
- *Index strategy trong IndexedDB (theo `url`, `updatedAt`, `tags`).*
- *Migration plan khi schema thay đổi.*
- *Cache eviction policy (LRU cho ContextCache, LRU cho Conversation).*
- *Encryption boundary: gì được mã hóa, gì không.*)

### 3.2 Data Dictionary (placeholder)

| Entity | Field | Type | Mô tả | Constraints |
|---|---|---|---|---|
| Conversation | id | string (UUID v4) | Khóa chính | unique |
| Conversation | url | string | URL trang gốc | required, max 2048 chars |
| Conversation | pageFingerprint | string (SHA-256 hex) | Hash của title + content normalized | required, 64 chars |
| Conversation | tags | string[] | User-defined tags | max 10 tags |
| Message | role | enum (`user` / `assistant` / `system`) | Role của message | required |
| Message | citations | string[] | Sentence IDs tham chiếu | optional |
| Settings | theme | enum (`light` / `dark` / `auto`) | UI theme | default `auto` |
| ContextCache | ttlSeconds | int | Time-to-live của cache entry | default 3600 |

*(Sẽ bổ sung khi viết chi tiết.)*

---

## 4. Component Design

### 4.1 Context Engine (`src/core/context-engine/`)

**Reference SRS**: FR-04, Hình 4 (Flowchart), Hình 5 (State Machine).

**Public interface** (TypeScript — placeholder):

```typescript
interface ContextEngine {
  extract(tabId: number): Promise<PageContext>;
  classify(url: string, document: Document): PageType;
  cache(context: PageContext): Promise<void>;
  getCached(url: string): Promise<PageContext | null>;
}

type PageType = 'youtube' | 'article' | 'pdf' | 'docs' | 'general';

interface PageContext {
  url: string;
  title: string;
  author?: string;
  date?: string;
  content: string;
  sentences: Sentence[];
  metadata: Record<string, unknown>;
}

interface Sentence {
  id: string;        // stable ID, hash of content + position
  text: string;
  range: [number, number]; // character offsets in `content`
}
```

**Sub-modules** (sẽ chi tiết phase sau):

- `pipelines/youtube.pipeline.ts` — FR-04 acceptance #4
- `pipelines/article.pipeline.ts` — FR-04 acceptance #3
- `pipelines/pdf.pipeline.ts` — FR-04 acceptance #5
- `pipelines/docs.pipeline.ts` — FR-04 acceptance #6
- `pipelines/general.pipeline.ts` — FR-04 acceptance #7
- `noise-filter.ts` — FR-04 acceptance #8
- `chunker.ts` — Split content thành 512-token chunks

### 4.2 Citation Manager (`src/core/citation/`)

**Reference SRS**: FR-05, Hình 3 (Sequence Chat + Citation).

**Public interface** (placeholder):

```typescript
interface CitationManager {
  attachCitations(
    aiAnswer: string,
    context: PageContext
  ): { annotatedAnswer: string; citations: CitationMap };

  highlight(sentenceId: string): Promise<void>;
}

interface CitationMap {
  [anchorId: string]: { sentenceId: string; quote: string };
}
```

*(Sẽ chi tiết ở phase sau: highlight strategy, cross-frame handling, SPA re-render resilience.)*

### 4.3 Crypto Module (`src/core/crypto/`)

**Reference SRS**: FR-02, NFR-02, Hình 7 (Sequence API Key Encryption).

**Public interface** (placeholder):

```typescript
interface CryptoModule {
  deriveKey(salt: string): Promise<CryptoKey>;
  encrypt(plaintext: string, key: CryptoKey): Promise<EncryptedPayload>;
  decrypt(payload: EncryptedPayload, key: CryptoKey): Promise<string>;
}

interface EncryptedPayload {
  ciphertext: string;  // base64
  iv: string;          // base64
  keyVersion: string;  // for future rotation
}
```

### 4.4 AI Adapter (`src/core/ai-adapter/`)

**Reference SRS**: FR-03, FR-02 (validate).

**Public interface** (placeholder):

```typescript
interface AIAdapter {
  provider: 'openai' | 'anthropic' | 'gemini';
  validateKey(key: string): Promise<boolean>;
  streamChat(
    messages: ChatMessage[],
    options: ChatOptions,
    onChunk: (chunk: string) => void
  ): Promise<void>;
}

interface ChatOptions {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}
```

**Sub-classes**: `OpenAIAdapter`, `AnthropicAdapter`, `GeminiAdapter`. Mỗi adapter implement `parseStreamChunk()` riêng vì mỗi provider format response khác nhau.

### 4.5 History Manager (`src/core/history/`)

**Reference SRS**: FR-06.

**Public interface** (placeholder):

```typescript
interface HistoryManager {
  list(): Promise<Conversation[]>;
  search(query: string): Promise<Conversation[]>;
  save(conv: Conversation): Promise<void>;
  delete(id: string): Promise<void>;
  export(id: string, format: 'md' | 'json'): Promise<string>;
}
```

### 4.6 Settings Manager (`src/core/settings/`)

**Reference SRS**: FR-08, FR-09.

**Public interface** (placeholder):

```typescript
interface SettingsManager {
  get<K extends keyof Settings>(key: K): Promise<Settings[K]>;
  set<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void>;
  clearAll(): Promise<void>;  // for FR-09 Clear all data
}
```

### 4.7 FAB Controller (`src/content/fab/`)

**Reference SRS**: FR-01.

**Public interface** (placeholder):

```typescript
interface FABController {
  inject(): void;
  remove(): void;
  setPosition(x: number, y: number): Promise<void>;
  onClick(handler: () => void): void;
}
```

### 4.8 Keyboard Shortcut Manager (`src/background/commands/`)

**Reference SRS**: FR-10.

**Public interface** (placeholder):

```typescript
interface KeyboardShortcutManager {
  register(shortcuts: ShortcutMap): void;
}

type ShortcutMap = {
  togglePanel: string;     // default: 'Ctrl+Shift+Y'
  focusInput: string;      // default: 'Ctrl+Shift+L'
  newChat: string;         // default: 'Ctrl+Shift+N'
  copyLastAnswer: string;  // default: 'Ctrl+Shift+C'
};
```

---

## 5. Interface Design

### 5.1 Internal Interfaces

> **Tham chiếu**: SRS §3.1.2.

| Interface | Sender | Receiver | Protocol |
|---|---|---|---|
| `requestContext` | Side Panel | Content Script | `chrome.tabs.sendMessage` |
| `chat` | Side Panel | Service Worker | `chrome.runtime.sendMessage` (request + stream chunks qua port) |
| `highlight` | Side Panel | Content Script | `chrome.tabs.sendMessage` |
| `validateKey` | Options | Service Worker | `chrome.runtime.sendMessage` |
| `getSettings` / `setSettings` | UI | Service Worker | `chrome.runtime.sendMessage` |

### 5.2 External Interfaces (AI Providers)

| Provider | Endpoint | Auth | Streaming |
|---|---|---|---|
| OpenAI | `https://api.openai.com/v1/chat/completions` | `Authorization: Bearer <key>` | SSE (`data: ...\n\n`) |
| Anthropic | `https://api.anthropic.com/v1/messages` | `x-api-key: <key>` + `anthropic-version: 2023-06-01` | SSE |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/models/...:streamGenerateContent` | `?key=<key>` query param | SSE |

### 5.3 YouTube Timedtext Interface

| Endpoint | Response Format |
|---|---|
| `https://www.youtube.com/api/timedtext?lang=<lang>&v=<videoId>&fmt=json3` | JSON3 |
| `https://www.youtube.com/api/timedtext?lang=<lang>&v=<videoId>` | XML (legacy) |

Parser: `WebVTTCue` / custom JSON3 parser → array of `{start, end, text}`.

---

## 6. Human-Machine Interface Design

### 6.1 Side Panel

> **Wireframe tham chiếu từ SRS**: [SRS §3.1.1.1](./SRS.md#3111-side-panel-ascii-wireframe).

*(Sẽ viết chi tiết ở phase sau:*

- *Component tree (React).*
- *State machine cho chat UI (idle → streaming → done → error).*
- *Accessibility (ARIA, keyboard nav, focus management).*
- *Theme (light/dark/auto CSS variables).*
- *Responsive behavior trong panel width có thể thay đổi.)*

### 6.2 Floating Action Button

> **Tham chiếu**: SRS §3.1.1.2, FR-01.

*(Sẽ chi tiết: shadow DOM để tránh conflict với page CSS, position persistence, drag-to-reposition.)*

### 6.3 Options Page

> **Tham chiếu**: SRS §3.1.1.3.

*(Sẽ chi tiết: tab navigation, form validation, success/error states.)*

---

## 7. Appendices

### Appendix A: Requirements-to-Component Traceability Matrix

Bảng này sẽ được điền **đầy đủ ở phase sau** khi các component đã được implement. Mục đích: truy ngược từng FR / NFR tới component chịu trách nhiệm.

| Requirement | Component(s) | Status |
|---|---|---|
| FR-01: Mở/đóng panel | Service Worker + FABController | Designed |
| FR-02: Quản lý API key | Options Page + CryptoModule | Designed |
| FR-03: Chat multi-turn | Side Panel + AIAdapter | Designed |
| FR-04: Context extraction | Content Script + ContextEngine | Designed |
| FR-05: Citation & highlight | Side Panel + CitationManager + Content Script | Designed |
| FR-06: Conversation history | Side Panel + HistoryManager | Designed |
| FR-07: Quick actions | Side Panel + ContextMenus | Designed |
| FR-08: Settings | Options Page + SettingsManager | Designed |
| FR-09: Privacy controls | Options Page + SettingsManager + CryptoModule | Designed |
| FR-10: Keyboard shortcuts | Service Worker + KeyboardShortcutManager | Designed |
| NFR-01: Performance | All modules (lazy load, cache, debounce) | Designed |
| NFR-02: Security | CryptoModule + manifest CSP + DOMPurify | Designed |
| NFR-03: Reliability | Service Worker retry + storage.session | Designed |
| NFR-04: Usability | Side Panel + i18n | Designed |
| NFR-05: Compatibility | Manifest MV3 + cross-browser testing | Designed |
| NFR-06: Maintainability | TypeScript + ESLint + Vitest | Designed |
| NFR-07: Portability | No OS-specific APIs | Designed |

### Appendix B: Diagrams Index (tham chiếu SRS)

| Hình | Mô tả | Section trong SDS | Trạng thái |
|---|---|---|---|
| Hình 1 | Use-case tổng quát | SRS §2.2 (tham chiếu) | Tái sử dụng nguyên |
| Hình 2 | Component architecture | §2.1 (kiến trúc tổng thể) | Tái sử dụng nguyên |
| Hình 3 | Sequence chat + citation | §4.2 Citation Manager | Tái sử dụng nguyên |
| Hình 4 | Context engine flowchart | §4.1 Context Engine | Tái sử dụng nguyên |
| Hình 5 | State machine extraction | §4.1 Context Engine | Tái sử dụng nguyên |
| Hình 6 | Storage ER diagram | §3.1 Storage Schema | Tái sử dụng nguyên |
| Hình 7 | Sequence API key encryption | §4.3 Crypto Module | Tái sử dụng nguyên |
| Hình 8 | Feature comparison matrix | SRS Appendix A (tham chiếu) | Tái sử dụng nguyên |

### Appendix C: Open Design Decisions (cần resolve ở phase sau)

| # | Decision | Options | Recommended |
|---|---|---|---|
| 1 | UI framework cho Side Panel | React 18 vs Svelte vs vanilla TS | **React 18** (ecosystem lớn, dev quen thuộc) |
| 2 | Extension framework | CRXJS vs Plasmo vs WXT | **WXT** (Vite-native, modern, MV3-first) |
| 3 | State management | Zustand vs Redux vs Context | **Zustand** (nhẹ, đủ dùng) |
| 4 | Markdown renderer | react-markdown vs marked | **react-markdown** + DOMPurify (an toàn) |
| 5 | Code highlight | Shiki vs Prism vs highlight.js | **Shiki** (chất lượng cao, theme light/dark) |
| 6 | PDF parsing | pdf.js (Mozilla) vs pdfjs-dist | **pdfjs-dist** (npm package) |
| 7 | Test framework | Vitest vs Jest | **Vitest** (Vite-native) |

---

**End of SDS Skeleton — SideMind v0.1.0**

> **Next steps**: Sau khi SRS được review và duyệt, điền chi tiết các section 2.3, 3, 4, 6 và Appendix A. Tham khảo `init_promt.md` cho ngữ cảnh bài tập lớn cuối kỳ.
