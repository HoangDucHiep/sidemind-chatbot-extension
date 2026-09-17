# PROJECT PLAN — SideMind Chrome Extension

> **Ngày tạo**: 2026-09-17
> **Deadline**: 2026-09-26 (Thứ 6)
> **Team**: 4 dev full-stack
> **Methodology**: Agile Scrum-lite (5 sprints × 1.5–2 ngày + demo buffer)
> **Status**: APPROVED · v1.0

---

## 1. Mục tiêu

Ra mắt **SideMind v0.1.0-alpha** — Chrome Extension (Manifest V3) chạy được end-to-end, cài qua "Load unpacked", có thể:
- Chat với 3 AI providers (OpenAI, Anthropic, Gemini) dùng API key user tự cấp.
- Trích xuất context từ 5 loại page (article, YouTube, PDF, docs, generic).
- Citation inline `[n]` clickable, highlight đoạn gốc trên page.
- Slash command 10 cái, multi-tab context, attach ảnh/PDF.
- Options page 4 tabs, history modal, onboarding, 4 error states.
- EN ⇄ VI, Light/Dark/Auto theme, WCAG 2.1 AA.

**Không trong scope v0.1.0-alpha**: Chrome Web Store publish, cloud sync, local LLM, mobile, OCR.

---

## 2. Baseline hiện tại

| Artifact | Trạng thái |
|---|---|
| `docs/SRS.md` v0.3.0 | ✅ Frozen |
| `docs/SDS.md` v0.1.0 (skeleton) | ✅ Section 2.x placeholder; sẽ fill khi code chín |
| `mockups/*.html` × 11 | ✅ Đầy đủ (index + 9 mockup + coverage matrix) |
| `mockups/_shared/*` (CSS/JS design system) | ✅ Port sang `src/styles/` |
| `.cursor/rules/*.mdc` × 5 | ✅ Architecture, TS, Chrome MV3, docs, context |
| `AGENTS.md` | ✅ |
| **Source code `src/`** | ❌ **CHƯA CÓ** — phase này |

---

## 3. Timeline (5 sprints + demo buffer)

```
T2   T3   T4   T5   T6   | T2   T3   T4   T5   T6 → Deadline 26/09
18   19   20   21   22   | 23   24   25   26 demo
┌──S1──────┐┌──S2──────┐┌─┐┌──S4──────┐┌──S5──────┐┌──┐
   Foundation    Core chat    S3   Multi+Attach   Test+a11y   Demo
```

| Sprint | Ngày | Output chính |
|---|---|---|
| **S1 Foundation** | T2-T3 18-19/9 | Extension install, FAB mở side panel, i18n/theme, storage wrapper |
| **S2 Core chat** | T4-T5 20-21/9 | AI adapter 3 providers, streaming, context engine 5 types, citations, slash menu |
| **S3 Settings+History+Onboarding+Errors** | T6 22/9 | Options 4 tabs, API keys + AES-GCM, history modal, onboarding, 4 errors |
| **S4 Multi-tab+Attach+Shortcuts** | T2-T3 23-24/9 | FR-11 chips, FR-12 file, FR-10 shortcuts, FR-13 /extract |
| **S5 Test + Cross-cutting** | T4-T5 25/9 | NFR verification, manual smoke 50 cases, build prod |
| **Demo day** | T6 26/9 sáng | Recording, final commit, ZIP |

---

## 4. Phân công

| Member | Focus |
|---|---|
| Dev 1 (Tech lead) | Architecture, AI adapter, integration, code review |
| Dev 2 (UI/UX) | React Side Panel, FAB, options, onboarding, history UI |
| Dev 3 (Data/Crypto) | Context engine, crypto, storage, file parsers |
| Dev 4 (QA/Infra) | Test scripts, build/CI, security audit, demo, docs |

Pair rotation: S1 (1-2)+(3-4) · S2 (1-3)+(2-4) · S3 (1-4)+(2-3) · S4 (1-2)+(3-4) · S5 (1-2)+(3-4).

---

## 5. Daily cadence

- **09:00**: Daily standup 15 min (Zoom/Discord)
- **09:15–12:00 + 13:00–16:30**: Pair work blocks
- **16:30–17:00**: Wrap — update GitHub Project board, push commits
- **Cuối sprint**: Sprint Review (30 min) + Retrospective (20 min)

---

## 6. Definition of Done (per task)

- [ ] Code merged vào `main` qua PR, review ≥ 1 người
- [ ] `tsc --noEmit` pass
- [ ] ESLint + Prettier pass
- [ ] Tested manually trong Chrome unpacked
- [ ] FR mapping updated trong `mockups/00-design-coverage.md` (partial → full nếu cover)
- [ ] i18n key thêm vào `i18n.ts` (EN + VI)
- [ ] Không commit secret / `.env` / binary lớn

---

## 7. Risk register

| # | Risk | Mitigation |
|---|---|---|
| R1 | API rate-limit dev | Cache + dùng gpt-4o-mini; mỗi dev có key riêng |
| R2 | pdf.js / mammoth bundle lớn | Dynamic import chỉ khi attach file |
| R3 | CSP MV3 reject CDN | Tất cả bundle qua Vite, không CDN runtime |
| R4 | WXT breaking change | Pin version |
| R5 | FR-12 file parsing edge case | Giới hạn: PDF + TXT + ảnh; ghi "Limitations" trong docs |
| R6 | Merge conflict / misalign | Daily standup, pair programming, branch ngắn hạn |

---

## 8. Tooling

- **Framework**: WXT 0.20+, React 18, TypeScript 5 strict
- **State**: Zustand
- **HTTP**: fetch + ReadableStream (streaming)
- **Crypto**: WebCrypto API AES-GCM-256
- **Parsers**: pdfjs-dist, mammoth.js, SheetJS
- **Markdown**: marked + DOMPurify
- **i18n**: custom EN ⇄ VI dictionary
- **Build**: `wxt build` → `dist/`
- **Tracking**: GitHub Project board · PR template link FR · Slack #sidemind-eng

---

## 9. FR / NFR target

- **FR coverage (full)**: 13/13 (FR-01 → FR-13)
- **NFR coverage**: ≥ 7/9 (NFR-06 Maintainability, NFR-07 Portability là n/a ở phase mockup/code đầu)
- **Mockup → Code**: 11/11 file có implementation phía sau

---

## 10. Sprint task details

(Sprint-by-sprint breakdown chi tiết nằm ở phần dưới — phục vụ execution.)

### S1 Foundation (T2-T3 18-19/9)

**Pair (1,2) — UI skeleton:**
- T1.1 Manifest V3 + permissions theo `chrome-mv3-rules.mdc`
- T1.2 `src/entrypoints/sidepanel/` React shell
- T1.3 `src/entrypoints/content.ts` inject FAB
- T1.4 `src/entrypoints/background.ts` message router + sidePanel.open
- T1.5 Port `_shared/*` CSS từ `mockups/` sang `src/styles/`

**Pair (3,4) — Infra:**
- T1.6 `src/lib/storage.ts` wrapper `chrome.storage.local`
- T1.7 `src/lib/i18n.ts` port EN ⇄ VI
- T1.8 `src/lib/theme.ts` light/dark/auto
- T1.9 `src/components/Seg.tsx`
- T1.10 `src/components/Card.tsx`, `Button.tsx`, `IconButton.tsx`

**DoD**: FAB mở panel, EN/VI + theme toggle persistent.

### S2 Core chat (T4-T5 20-21/9)

**Pair (1,3) — AI + Context:**
- T2.1 `src/lib/ai/types.ts` interfaces
- T2.2–T2.4 OpenAI / Anthropic / Gemini streaming
- T2.5 `src/lib/ai/index.ts` factory + route
- T2.6 `src/lib/context/engine.ts` 5 page types
- T2.7 `src/lib/context/prompts.ts` system templates
- T2.8 `src/lib/citation.ts` map answer ↔ source

**Pair (2,4) — UI:**
- T2.9 `Message.tsx`
- T2.10 `StreamingMessage.tsx`
- T2.11 `SlashMenu.tsx` 8 commands
- T2.12 `useChat.ts` Zustand store
- T2.13 `useContext.ts` message bridge
- T2.14 `CitationRef.tsx` click → highlight

**DoD**: Send → stream response, 3 providers, slash menu, citation click highlight.

### S3 Settings + History + Onboarding + Errors (T6 22/9)

- T3.1 `src/lib/crypto.ts` AES-GCM-256
- T3.2 `src/entrypoints/options/` 4 tabs
- T3.3 `ApiKeyRow.tsx` + status badge
- T3.4 `src/lib/keys/test.ts` key verify
- T3.5 Settings/General (theme, model, temp, tokens, font, page mode)
- T3.6 Settings/Privacy (telemetry OFF default, incognito, danger zone)
- T3.7 Settings/Shortcuts (keycap table)
- T3.8 History/Modal (search, tags, list)
- T3.9 Onboarding (3-step spotlight)
- T3.10 Errors/ (no-key, network, quota-429, extraction)
- T3.11 `src/lib/history.ts` CRUD + LRU 1000

**DoD**: Mọi options tab hoạt động, key encrypted, onboarding hiện lần đầu, 4 errors trigger được.

### S4 Multi-tab + Attach + Shortcuts + Polish (T2-T3 23-24/9)

**Pair (1,2) — Multi-tab + Quick actions:**
- T4.1 `src/lib/tabs.ts`
- T4.2 `SourceChips.tsx`
- T4.3 `AddTabPopup.tsx`
- T4.4 `QuickActionMenu.tsx` (Chrome context menu)
- T4.5 Extend slash menu: `/tabs`, `/attach`, `/extract`

**Pair (3,4) — File + Shortcuts:**
- T4.6 `src/lib/files/picker.ts`
- T4.7 `src/lib/files/parsers.ts` (pdfjs, mammoth, xlsx, image base64)
- T4.8 `src/lib/files/size.ts` 20MB warn / 50MB block
- T4.9 `FileChip.tsx`
- T4.10 `chrome.commands` registration (4 shortcuts)
- T4.11 `src/lib/shortcuts/copyLast.ts`

**Cross-pair:**
- T4.12 Citation highlight thật sự
- T4.13 Telemetry stub (OFF default)
- T4.14 Side panel context header

**DoD**: 13/13 FR có demo, multi-tab hoạt động, attach ảnh/PDF ok, shortcuts nhận.

### S5 Test + Cross-cutting (T4-T5 25/9)

**Pair (1,4) — NFR verification:**
- T5.1 NFR-01 Performance
- T5.2 NFR-02 Security audit
- T5.3 NFR-03 Retry/backoff
- T5.4 NFR-04 A11y
- T5.5 NFR-04 i18n (no hardcoded)

**Pair (2,3) — Manual smoke + fix:**
- T5.6 50-case smoke test
- T5.7 Cross-browser (Chrome/Edge/Brave)
- T5.8 Fix P0/P1
- T5.9 `wxt build` prod sạch

**DoD**: Smoke pass, build < 5MB, no critical bug.

### Demo day (T6 26/9 sáng)

- T6.1 Final commit `v0.1.0-alpha`
- T6.2 Recording 3 phút
- T6.3 Update SRS §1.5 status
- T6.4 ZIP extension
- T6.5 Rehearsal

---

## 11. Out-of-scope (defer v2.0)

- ❌ Chrome Web Store publish
- ❌ Cloud sync
- ❌ Local LLM (WebLLM)
- ❌ Mobile / Firefox
- ❌ OCR multipage scan
- ❌ Video file > 20MB
- ❌ Custom hotkey conflict UI
- ❌ Plugin system

---

## 12. References

- [SRS.md](./SRS.md) — yêu cầu nguồn
- [SDS.md](./SDS.md) — thiết kế nguồn
- [`../mockups/00-coverage.html`](../mockups/00-coverage.html) — visual matrix
- [`../.cursor/rules/chrome-mv3-rules.mdc`](../.cursor/rules/chrome-mv3-rules.mdc) — MV3 rules
- [`../.cursor/rules/core-architecture.mdc`](../.cursor/rules/core-architecture.mdc) — kiến trúc cốt lõi
