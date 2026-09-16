# SideMind — AGENT.md

> Tài liệu này dành cho AI agent (và dev mới) khi vào project SideMind.
> Đọc file này **trước khi** sửa bất kỳ file nào trong repo.

## 1. Project Overview

**SideMind** là Chrome Extension (Manifest V3) hoạt động như chat sidebar tích hợp AI trên trình duyệt. Sản phẩm thuộc đồ án cuối kỳ môn **UDDN** — phục vụ so sánh với Microsoft Copilot (Edge sidebar) và Gemini in Chrome (side panel).

**Điểm khác biệt cốt lõi**:
- **Open-source** (MIT), client-side only.
- **Multi-model AI**: OpenAI / Anthropic / Gemini — user tự cung cấp API key.
- **Context-awareness vượt trội**: 5 pipeline chuyên biệt (YouTube, Article, PDF, Docs, General).
- **Multi-tab context** (FR-11) + **File / image attachment** (FR-12) — xử lý client-side.
- **Citation + highlight** trên tab nền.

## 2. Tech Stack (đã chốt trong SRS §3.4)

| Layer | Technology |
|---|---|
| Extension framework | WXT (Vite-native, MV3-first) |
| Language | TypeScript (strict mode) |
| UI framework | React 18+ cho Side Panel và Options Page |
| State management | Zustand |
| Styling | TailwindCSS hoặc CSS Modules |
| Markdown | react-markdown + DOMPurify + rehype-highlight |
| PDF parsing | pdf.js (Mozilla) |
| Content extraction | Readability.js (Mozilla) |
| Test | Vitest |
| Lint | ESLint + Prettier |

## 3. Kiến trúc cốt lõi (NEVER VIOLATE)

### 3.1 No-backend, client-side only
- **Không** có server do nhóm phát triển.
- Mọi xử lý chạy trong browser process: Service Worker + Content Script + Side Panel.
- AI Provider API gọi trực tiếp qua HTTPS từ trình duyệt user — **không qua proxy**.
- Lý do: privacy, cost transparency, zero-ops, vendor neutrality, open-source friendly.
- **Trade-off chấp nhận**: không có cloud sync, không có multi-device. Đẩy sang v2.

### 3.2 Stateless
- Không database server, không session store, không analytics server.
- Toàn bộ state ở `chrome.storage.local` / `chrome.storage.session` / IndexedDB của user.
- Xóa extension = xóa hết data.

### 3.3 File processing cũng ở client (FR-12)
- Ảnh base64 → gửi thẳng multimodal request tới provider.
- File text/PDF/docx/xlsx → trích nội dung ở client bằng FileReader / pdf.js / mammoth.js / SheetJS.
- File **không bao giờ** upload tới server nào ngoài AI Provider.

## 4. Tài liệu quan trọng (đọc theo thứ tự)

1. **[docs/SRS.md](docs/SRS.md)** — Software Requirements Specification (v0.3.0). Đầu vào cho mọi thay đổi.
2. **[docs/SDS.md](docs/SDS.md)** — Software Design Specification (v0.1.0, skeleton). Sẽ điền chi tiết sau khi SRS duyệt.
3. **`.cursor/rules/`** — Rules hỗ trợ AI agent.

### 4.1 Quy ước ID ổn định

| Prefix | Quy tắc | Range hiện tại |
|---|---|---|
| FR | Functional Requirement | FR-01 → FR-13 |
| NFR | Non-Functional Requirement | NFR-01 → NFR-09 |
| Hình | Mermaid diagrams | Hình 1 → Hình 8 |

**KHÔNG BAO GIỜ** re-number một ID đã có. Khi cần thêm FR mới, dùng số tiếp theo (FR-14, FR-15, ...). Khi cần xóa, đánh dấu `**[DEPRECATED]**` và giữ ID.

### 4.2 Mermaid diagrams

SRS có **8 Mermaid diagrams** đánh số Hình 1–8. Quy tắc:
- Số Hình cố định, không thay đổi khi sửa nội dung.
- Thêm diagram mới → dùng số tiếp theo (Hình 9, ...).
- Không gộp 2 Hình thành 1.

## 5. Workflow đóng góp

### 5.1 Quy trình thay đổi SRS / SDS
1. Đọc kỹ SRS hiện tại để biết cấu trúc (Mục lục + 4 section chính).
2. Xác định rõ thay đổi thuộc section nào, FR / NFR nào.
3. Sửa bằng `StrReplace` riêng lẻ — **không ghi đè toàn bộ file**.
4. Giữ outline (Mục lục, heading) nguyên vẹn.
5. Cập nhật cross-reference: nếu thêm FR-14, đảm bảo SDS skeleton có chỗ để tham chiếu FR-14.
6. Cập nhật version trong header: `0.3.0` → `0.4.0` nếu thêm FR mới.

### 5.2 Quy trình thay đổi code (khi đã implement)
1. Mỗi FR có ID → tham chiếu trong code comment ở đầu module.
2. Acceptance criteria trong SRS → test case trong `src/__tests__/`.
3. Module mới phải theo **plugin pattern** (xem §6).
4. Không bundle code > 50 KB / file; check bundle size trước khi commit.

### 5.3 Commit message format
```
<scope>: <short description>

FR-xx | NFR-xx | docs | chore | fix | feat

Body giải thích WHY, không phải WHAT.
```

### 5.4 Trước khi commit
- [ ] Chạy `pnpm lint` và `pnpm test` — không được có lỗi mới.
- [ ] Nếu sửa SRS/SDS: kiểm tra cross-reference còn nguyên.
- [ ] Nếu thêm FR: bump version + cập nhật số FR trong §1.5 tổng quan.
- [ ] Nếu thêm Hình mới: cập nhật Appendix B Diagrams Index trong SDS.

## 6. Nguyên tắc thiết kế (Design Principles)

1. **Privacy by default**: không thu thập gì user không explicitly bật.
2. **User controls everything**: API key, telemetry, file processing, multi-tab selection.
3. **Module hóa**: mỗi concern là 1 module độc lập, dễ test, dễ swap.
4. **Plugin pattern cho extensibility**: Context engine pipelines, AI adapters, file extractors.
5. **Adapter pattern cho 3rd party**: AI providers, storage backend.
6. **No magic**: code phải đọc được, không clever tricks.
7. **i18n-first**: tất cả UI string qua `_locales/<lang>/messages.json`, không hardcode.

## 7. Cấu trúc thư mục (kế hoạch)

```
d:\University\UDDN\project\
├── docs/
│   ├── SRS.md                  # Software Requirements Specification
│   ├── SDS.md                  # Software Design Specification
│   └── diagrams/               # PNG/SVG render từ Mermaid (nếu cần)
├── src/
│   ├── background/             # Service Worker
│   │   └── commands/           # Keyboard shortcuts (FR-10)
│   ├── content/
│   │   ├── fab/                # FAB Controller (FR-01)
│   │   └── citation/           # Highlight anchor (FR-05)
│   ├── sidepanel/              # React app
│   │   ├── components/
│   │   ├── views/
│   │   └── store/              # Zustand stores
│   ├── options/                # React app
│   ├── core/
│   │   ├── context-engine/     # FR-04 + FR-11
│   │   │   └── pipelines/      # 5 pipelines: youtube/article/pdf/docs/general
│   │   ├── citation/           # FR-05
│   │   ├── crypto/             # FR-02 encryption
│   │   ├── ai-adapter/         # FR-03 (OpenAI/Anthropic/Gemini)
│   │   ├── history/            # FR-06
│   │   ├── settings/           # FR-08
│   │   ├── multi-tab/          # FR-11 (NEW)
│   │   └── file-extractor/     # FR-12 (NEW)
│   └── __tests__/
├── public/
│   ├── _locales/
│   │   ├── en/messages.json
│   │   └── vi/messages.json
│   └── icons/
├── manifest.json
├── package.json
├── tsconfig.json
└── .cursor/
    └── rules/                  # Rules cho AI agent
```

## 8. Những điều KHÔNG được làm

- ❌ Thêm backend server / proxy / database.
- ❌ Re-number FR / NFR / Hình đã có.
- ❌ Ghi đè toàn bộ `docs/SRS.md` hoặc `docs/SDS.md`.
- ❌ Bundle code fetch runtime (`eval`, `new Function`, dynamic `import()` từ URL).
- ❌ Log API key, conversation content ra console.
- ❌ Gửi bất kỳ data nào tới domain ngoài `host_permissions` đã khai báo.
- ❌ Dùng MV2 syntax hoặc persistent background page.
- ❌ Inline script, eval, `Function()` constructor.
- ❌ Save file binary vào `chrome.storage` / IndexedDB (FR-12 chỉ lưu metadata).
- ❌ Hardcode UI string (phải qua i18n key).

## 9. Đối tượng so sánh (cho phần so sánh trong báo cáo)

| Sản phẩm | Loại | Ghi chú |
|---|---|---|
| **SideMind** (đề xuất) | Chrome Extension, MIT, user-host | Đối tượng chính |
| **Microsoft Copilot** | Tích hợp sẵn Edge sidebar | Đối tượng so sánh #1 |
| **Gemini in Chrome** | Side panel trong Chrome | Đối tượng so sánh #2 (KHÔNG phải gemini.google.com) |

Bảng so sánh đầy đủ 26 dòng ở [docs/SRS.md Phụ lục A](docs/SRS.md).

## 10. Glossary rút gọn

| Thuật ngữ | Nghĩa |
|---|---|
| MV3 | Manifest V3 |
| FAB | Floating Action Button |
| FR / NFR | Functional / Non-Functional Requirement |
| CSP | Content Security Policy |
| LRU | Least Recently Used (cache eviction) |
| p95 | 95th percentile (latency metric) |
| AES-GCM | Advanced Encryption Standard — Galois/Counter Mode |
| JSON3 / WebVTT | YouTube / web video caption formats |
| WASM | WebAssembly (cho future Tesseract OCR) |

---

**Khi AI agent vào project**: đọc §1, §3, §4.1, §8 trước. Các section khác đọc khi cần.
