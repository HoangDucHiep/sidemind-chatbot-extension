# Smart Context & Memory Optimization Specification — SideMind

> **Phiên bản**: v1.0.0  
> **Ngày tạo**: 2026-10-10  
> **Mục tiêu**: Thiết kế và triển khai kiến trúc nén bộ nhớ (Memory Compression), quản lý ngữ cảnh linh hoạt (Dynamic Context Budgeting) và RAG nhẹ tại client (Client-side RAG) giúp giảm 70–90% chi phí API Token, tăng tốc độ phản hồi và hỗ trợ tài liệu PDF / Multi-tab lớn.

---

## 1. Tổng quan Kiến trúc Smart Context & Memory Manager (SCMM)

Hệ thống quản lý ngữ cảnh của SideMind hoạt động theo mô hình luồng dữ liệu 4 bước tự động hóa hoàn toàn tại Client (Browser Service Worker & React Side Panel):

```
[User Query + Web Content / PDF / Multi-tabs]
                      │
                      ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ STEP 1: Dynamic Context Budgeting (Phân bổ Token Budget)    │
 └────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ STEP 2: Local RAG với MiniSearch (Lọc lấy Top-K Chunks)     │
 └────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ STEP 3: 3-Tier Memory Assembly & Session Dreaming           │
 │  ├── Tier 1: Working Memory (4 tin nhắn gần nhất)           │
 │  ├── Tier 2: Summary Memory (Bản tóm tắt tin nhắn cũ)       │
 │  └── Tier 3: User Persona (Hồ sơ & phong cách cá nhân)      │
 └────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
      [Gửi Stream Request tới AI Provider API]
```

---

## 2. Chi tiết 5 Kỹ thuật cốt lõi & Giải pháp Tinh chỉnh

### 2.1. Dynamic Context Budgeting (Phân bổ Ngân sách Token)
* **Ý tưởng**: Không bao giờ gửi tràn cửa sổ ngữ cảnh (Context Window) của mô hình AI.
* **Cơ chế**:
  - `System Prompt & User Persona`: Cố định **10%** ngân sách.
  - `User Query + Working Memory`: Ưu tiên **30%** ngân sách.
  - `Web / File Context`: Dùng **60%** ngân sách còn lại.
* **Quy tắc cắt tỉa**: Nếu văn bản nguồn vượt quá 60% ngân sách, tự động kích hoạt **Local RAG** để bóc tách thông tin thay vì cắt thô.

### 2.2. Local RAG & Semantic Search (`MiniSearch`)
* **Kỹ thuật phù hợp**: Sử dụng thư viện **`MiniSearch`** (dung lượng cực nhẹ **~7KB gzipped**, 100% JS thuần, không dùng WASM/WebGPU nặng).
* **Quy trình xử lý**:
  1. Cắt văn bản từ PDF / Web / Multi-tab thành các đoạn `Chunk` (~200–300 từ).
  2. Tạo bộ chỉ mục tìm kiếm (Search Index) tạm thời trong RAM.
  3. Khi đặt câu hỏi, thực hiện `MiniSearch.search(userQuery)` để trích xuất **Top 3–5 Chunks** có điểm liên quan nhất.

### 2.3. 3-Tier Memory Architecture (Bộ nhớ 3 Tầng)
* **Tier 1 — Working Memory**: Giữ 4 tin nhắn gần nhất dạng văn bản gốc để đảm bảo mạch hội thoại tự nhiên.
* **Tier 2 — Summary Memory**: Bản tóm tắt súc tích diễn biến các tin nhắn cũ hơn.
* **Tier 3 — User Persona & Long-term Context**: Cấu hình sở thích cá nhân và ngữ cảnh gốc của bài viết.

### 2.4. Session Dreaming (Nén bộ nhớ ngầm theo phiên)
* **Tinh chỉnh cho MV3**: Thay vì dùng background idle dreaming (dễ bị Chrome MV3 kill Service Worker sau 30s rảnh rỗi), sử dụng **Session Dreaming (Nén khi đạt ngưỡng tin nhắn)**.
* **Cơ chế**:
  - Khi lịch sử chat đạt từ **tin nhắn thứ 6 trở lên**, hệ thống chạy một request ngầm gửi tới mô hình AI nhỏ (`gpt-4o-mini`, `claude-3-haiku`, `gemini-1.5-flash`):
    > *"Tóm tắt ngắn gọn các ý chính và kết luận đã đạt được trong lịch sử chat sau đây dưới 150 từ:"*
  - Gộp các tin nhắn cũ thành 1 đoạn `Summary Block` duy nhất trong RAM và giải phóng bớt danh sách tin nhắn chi tiết.

### 2.5. Persistent User Persona & Preferences (Hồ sơ cá nhân)
* **Cơ chế**: Thêm tùy chỉnh trong trang Options cho phép lưu hồ sơ người dùng (ví dụ: *"Tôi là Developer, ưu tiên trả lời bằng tiếng Việt, ngắn gọn, kèm code ví dụ"*).
* **Lưu trữ**: Lưu trong `chrome.storage.local` và tự động chèn vào System Prompt của mọi cuộc trò chuyện.

---

## 3. Các Lưu ý Kỹ thuật Quan trọng (Chrome MV3 & Client-side)

> [!IMPORTANT]
> **Không sử dụng mô hình Local Embedding nặng (WASM / WebGPU / Transformers.js 50MB+)**:
> Việc tải các file weights nặng sẽ làm nảy sinh vấn đề rò rỉ bộ nhớ, làm sập Service Worker và vi phạm tiêu chuẩn dung lượng Extension (< 5MB). Dùng `MiniSearch` JS thuần là lựa chọn tối ưu.

> [!WARNING]
> **Tránh rò rỉ API Key và dữ liệu riêng tư**:
> Mọi thao tác chunking, nén dữ liệu và tìm kiếm phải thực hiện 100% tại Client. API Key luôn được giải mã tạm thời từ AES-GCM trong RAM khi gọi AI Provider.

> [!NOTE]
> **Xử lý bất đồng bộ trong Service Worker**:
> Hàm nén `Session Dreaming` cần chạy ở chế độ `non-blocking` (không chặn luồng chat chính của người dùng).

---

## 4. Roadmap Triển khai Chi tiết (3 Giai đoạn)

```
┌──────────────────────────────────────────────────────────┐
│ PHASE 1: Budgeting & User Persona (Thời gian: ~1 ngày)   │
├──────────────────────────────────────────────────────────┤
│ PHASE 2: 3-Tier Memory & Session Dreaming (~1.5 ngày)    │
├──────────────────────────────────────────────────────────┤
│ PHASE 3: Local RAG với MiniSearch (~1.5 ngày)            │
└──────────────────────────────────────────────────────────┘
```

### 📌 Phase 1: Dynamic Budgeting & User Persona
- [x] **Task 1.1**: Thêm `user_persona` schema vào [storage.ts](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/lib/storage.ts).
- [x] **Task 1.2**: Xây dựng UI tùy chỉnh Persona trong Options Page (`src/components/settings/GeneralTab.tsx`).
- [x] **Task 1.3**: Viết module phân bổ ngân sách Token [budget.ts](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/lib/context/budget.ts) dựa trên model được chọn.
- [x] **Task 1.4**: Cập nhật `src/lib/context/prompts.ts` tích hợp Persona và Token Budgeting.

### 📌 Phase 2: 3-Tier Memory & Session Dreaming
- [x] **Task 2.1**: Cập nhật Zustand store [useChat.ts](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/store/useChat.ts) hỗ trợ `summaryState` và `workingMemory`.
- [x] **Task 2.2**: Lập trình hàm `summarizeSessionHistory()` gọi API nén ngầm khi lịch sử chat ≥ 6 tin nhắn ([memory.ts](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/lib/context/memory.ts)).
- [x] **Task 2.3**: Xử lý ghép nối 3 tầng bộ nhớ trước khi gửi request tới AI Adapters ([src/lib/ai/](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/lib/ai/)).
- [x] **Task 2.4**: Viết unit test cho cơ chế nén bộ nhớ ([src/__tests__/memory.test.ts](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/__tests__/memory.test.ts)).

### 📌 Phase 3: Client-side Local RAG (`MiniSearch`)
- [x] **Task 3.1**: Cài đặt gói `minisearch` vào `sidemind/package.json`.
- [x] **Task 3.2**: Viết module bóc tách và tạo index văn bản [rag.ts](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/lib/context/rag.ts).
- [x] **Task 3.3**: Kết nối `rag.ts` với Multi-tab Context (`useMultiTab.ts`), File Extractor (`src/lib/file-extractor/`) và `prompts.ts` / `useChat.ts`.
- [x] **Task 3.4**: Đánh giá hiệu năng tìm kiếm và viết unit test [rag.test.ts](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/__tests__/rag.test.ts).

---

## 5. Checklist Kiểm thử & Đánh giá Hiệu quả (Metrics & DoD)

- [x] **Độ giảm Token (Token Reduction)**: Giảm tối thiểu **70% lượng Token** trong các cuộc trò chuyện dài > 10 tin nhắn qua cơ chế Session Dreaming.
- [x] **Tốc độ phản hồi (Latency)**: Thời gian chuẩn bị prompt (Budgeting + Local RAG + Memory Assembly) < **50ms** chạy thuần RAM.
- [x] **Dung lượng Extension (Bundle Size)**: Tổng dung lượng sau build `dist/` chỉ **713 kB** (< **5MB**).
- [x] **Độ chính xác (Accuracy & Relevance)**: Local RAG xếp hạng Top đoạn liên quan nhất và đánh số citation `[1]`, `[tab1] [1]`, `[file1] [1]` chuẩn xác.
