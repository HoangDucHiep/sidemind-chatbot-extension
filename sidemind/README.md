# SideMind · Chrome Extension

> AI chat sidebar with context awareness. Manifest V3, no-backend, client-side only.

[![Status](https://img.shields.io/badge/status-v0.1.0--alpha-orange)]()
[![SRS](https://img.shields.io/badge/SRS-v0.3.0-blue)](../docs/SRS.md)
[![Plan](https://img.shields.io/badge/plan-2026--09--26-red)](../docs/PROJECT-PLAN.md)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template và điền API key của bạn
cp .env.example .env.local
# Mở .env.local, paste OPENAI_API_KEY (và tuỳ chọn ANTHROPIC_API_KEY / GEMINI_API_KEY)

# 3. Start dev mode
npm run dev

# 4. Load extension trong Chrome:
#    - Mở chrome://extensions
#    - Bật "Developer mode" (toggle góc phải)
#    - Click "Load unpacked"
#    - Chọn folder .output/chrome-mv3 (WXT tự tạo)
#    - Extension xuất hiện trong toolbar

# 5. Click icon SideMind hoặc FAB trên page → side panel mở
```

## Available scripts

| Script | Mô tả |
|---|---|
| `npm run dev` | Dev mode với hot reload (Chrome) |
| `npm run dev:firefox` | Dev mode cho Firefox |
| `npm run build` | Production build → `../dist/` |
| `npm run zip` | Tạo ZIP cho Chrome Web Store submission |
| `npm run typecheck` | TypeScript strict check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run test` | Vitest |

## Tech stack

- **Framework**: [WXT](https://wxt.dev/) (Vite-based MV3)
- **UI**: React 18 + TypeScript 5 strict
- **State**: Zustand
- **Crypto**: WebCrypto API (AES-GCM-256)
- **Parsers**: pdfjs-dist, mammoth.js, xlsx
- **Markdown**: marked + DOMPurify
- **i18n**: EN ⇄ VI custom dictionary (port từ `mockups/_shared/i18n.js`)

## Project structure

```
sidemind/
├── src/
│   ├── entrypoints/         # MV3 entry points
│   │   ├── background.ts    # Service worker
│   │   ├── content.ts       # Content script (FAB + context)
│   │   ├── sidepanel/       # Side panel React app
│   │   └── options/         # Options page React app
│   ├── components/
│   │   ├── chat/
│   │   ├── settings/
│   │   ├── history/
│   │   └── ui/              # Design system primitives
│   ├── lib/
│   │   ├── ai/              # OpenAI / Anthropic / Gemini
│   │   ├── context/         # Context extraction engine
│   │   ├── files/           # File parsers (image, PDF, docx, xlsx)
│   │   ├── crypto.ts        # AES-GCM
│   │   ├── history.ts       # Conversation CRUD
│   │   ├── i18n.ts          # EN ⇄ VI
│   │   ├── storage.ts       # chrome.storage wrapper
│   │   └── theme.ts
│   ├── styles/
│   │   ├── tokens.css       # From mockups/_shared/tokens.css
│   │   ├── base.css
│   │   └── components.css
│   └── types/
├── public/
│   └── icon/                # 16, 32, 48, 128 px
├── wxt.config.ts
├── tsconfig.json
├── .env.example
└── package.json
```

## Architecture decisions

Tuân thủ các rule đã chốt trong `.cursor/rules/`:

- **No-backend** (`core-architecture.mdc` §1) — không proxy server. AI provider gọi trực tiếp từ browser.
- **MV3 only** (`chrome-mv3-rules.mdc`) — Manifest V3, CSP nghiêm ngặt, no remote code, no inline scripts.
- **AES-GCM-256** cho API key — lưu `chrome.storage.local` đã mã hoá (`core-architecture.mdc` §5).
- **Tiếng Việt** cho docs/comments, **Tiếng Anh** cho code identifiers.

Xem chi tiết ở [`../docs/PROJECT-PLAN.md`](../docs/PROJECT-PLAN.md).

## Development workflow

### Branch strategy
```
main              ← production-ready, mỗi commit đều chạy được
├── feature/*     ← feature branches, tạo PR vào main
└── hotfix/*      ← critical bug fix
```

### PR template
Mỗi PR phải link tới FR / NFR mà nó cover. Ví dụ:
```
Fixes: FR-04 (context extraction)
Refs: NFR-04 (a11y)
```

### Daily standup
Mỗi sáng 09:00, 15 phút. Format: hôm qua / hôm nay / blocker.

## API key management

Mỗi dev tự dùng key riêng, KHÔNG share qua repo:

1. Tạo key từ dashboard provider yêu thích.
2. Paste vào `.env.local` (đã gitignore).
3. Build sẽ inject vào extension bundle.

Provider gợi ý cho dev:
- **OpenAI**: `gpt-4o-mini` rẻ + nhanh, đủ cho test.
- **Anthropic**: `claude-3-5-haiku` rẻ nhất, output dài.
- **Gemini**: `gemini-1.5-flash` free tier generous.

## References

- [SRS.md](../docs/SRS.md) — Software Requirements Specification
- [SDS.md](../docs/SDS.md) — Software Design Specification
- [PROJECT-PLAN.md](../docs/PROJECT-PLAN.md) — Sprint plan & task breakdown
- [Mockups](../mockups/) — UI design system + visual coverage matrix
- [VS Code rules](../.cursor/rules/) — Architecture & code standards

## License

MIT (TBD — confirm before release).
