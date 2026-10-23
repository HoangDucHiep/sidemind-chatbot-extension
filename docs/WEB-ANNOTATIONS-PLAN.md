# Kế hoạch Triển khai: Persistent Web Highlights & Comments — SideMind

> **Mã tính năng**: FR-14 (Đề xuất mở rộng)  
> **Tài liệu**: Technical Specification & Implementation Plan  
> **Trạng thái**: Draft / Đang chờ duyệt  
> **Mục tiêu**: Cho phép người dùng đánh dấu (Highlight) văn bản và đính kèm ghi chú (Comment) trực tiếp trên bất kỳ trang web nào; dữ liệu tự động lưu bền vững theo URL và khôi phục lại khi vào lại trang; hỗ trợ xóa bản lưu theo từng website và hỏi đáp AI dựa trên nội dung đã đánh dấu.

---

## 1. Mục tiêu & Trải nghiệm Người dùng (User Stories)

1. **Bôi đen & Đánh dấu (Highlight & Comment)**:
   - Khi người dùng bôi đen một đoạn văn bản trên trang web, một thanh công cụ nổi nhỏ (**Floating Mini Bubble**) xuất hiện với các nút:
     - 4 màu highlight: 🟡 Vàng (mặc định), 🟢 Xanh lá, 🔵 Xanh dương, 🟣 Hồng.
     - 💬 Nút **Thêm ghi chú (Add Comment)**: Mở khung nhập ghi chú nhanh ngay tại chỗ.
2. **Khôi phục Bền vững khi vào lại trang (Persistent Re-anchoring)**:
   - Dữ liệu được lưu trong `chrome.storage.local` theo URL chuẩn hóa.
   - Mỗi khi người dùng F5 hoặc mở lại trang web sau nhiều ngày, các đoạn chữ đã đánh dấu tự động được tô màu lại như cũ.
   - Khi rê chuột (hover) vào đoạn highlight, tooltip hiện nội dung ghi chú và thời gian tạo.
3. **Quản lý & Xóa bản lưu theo Website (Per-URL Management)**:
   - Có thể xóa từng đoạn highlight ngay trên trang web bằng nút 🗑️ trong tooltip.
   - Trong Side Panel: Có mục **"Notes & Highlights"** hiển thị danh sách tất cả các đoạn đã đánh dấu của trang web hiện tại, kèm nút:
     - 🗑️ **Xóa tất cả highlight của trang này (Clear All for this Page)**.
     - 🤖 **Hỏi AI về các đoạn này (Ask AI about Highlights)**.
     - 📋 **Xuất Markdown (Export to Notion/Obsidian)**.

---

## 2. Kiến trúc Kỹ thuật (Technical Architecture)

Tuân thủ nghiêm ngặt nguyên tắc cốt lõi của SideMind: **No-backend, 100% Client-side, Privacy by Default**.

```
[Người dùng bôi đen văn bản trên Web]
                  │
                  ▼ (MouseUp Event)
┌────────────────────────────────────────────────────────┐
│ Floating Mini Bubble [ 🟡 🟢 🔵 🟣 | 💬 Ghi chú ]     │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ W3C Text Quote Anchor Extraction                       │
│  - exact: "đoạn văn bản được chọn"                    │
│  - prefix: 30 ký tự văn bản phía trước                │
│  - suffix: 30 ký tự văn bản phía sau                  │
└─────────────────┬──────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ Storage Layer (chrome.storage.local)                   │
│ Key: `sidemind_annotations_map`                        │
│ URL Hash Key ➔ Array of WebAnnotation                 │
└─────────────────┬──────────────────────────────────────┘
                  ▲
                  │ Tự động nạp khi load trang
┌─────────────────┴──────────────────────────────────────┐
│ Re-anchoring Engine (DOM TreeWalker)                   │
│ Quét DOM trang web ➔ Bọc bằng thẻ <mark class="...">   │
└────────────────────────────────────────────────────────┘
```

### 2.1. Cấu trúc Dữ liệu (Annotation Schema)

```typescript
export interface WebAnnotation {
  id: string;                    // UUID ngẫu nhiên: "anno-1726000000000-xyz"
  url: string;                   // URL chuẩn hóa (loại bỏ tracking params, hash)
  title: string;                 // Tiêu đề trang web
  color: "yellow" | "green" | "blue" | "pink";
  selectedText: string;          // Đoạn text người dùng chọn
  comment?: string;              // Ghi chú của người dùng (nếu có)
  
  // W3C Text Quote Selector (Neo vị trí chính xác)
  anchor: {
    exact: string;
    prefix: string;              // 30 ký tự phía trước
    suffix: string;              // 30 ký tự phía sau
  };
  
  createdAt: number;
  updatedAt: number;
}

// Bảng ánh xạ lưu trong chrome.storage.local:
// Key: `sidemind_annotations_by_url` -> Record<normalizedUrl, WebAnnotation[]>
```

---

## 3. Lộ trình Triển khai Chi tiết (3 Giai đoạn)

### 📌 Giai đoạn 1: Core Storage & DOM Highlighting
*Mục tiêu: Bôi đen văn bản ➔ Tô màu highlight ➔ Lưu vào bộ nhớ extension.*

- [ ] **Task 1.1**: Tạo module quản lý dữ liệu [src/lib/annotations.ts](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/lib/annotations.ts) với các hàm CRUD:
  - `saveAnnotation(annotation: WebAnnotation): Promise<void>`
  - `getAnnotationsForUrl(url: string): Promise<WebAnnotation[]>`
  - `deleteAnnotation(id: string, url: string): Promise<void>`
  - `clearAnnotationsForUrl(url: string): Promise<void>`
  - `normalizeUrl(url: string): string` (loại bỏ `utm_*`, `#hash`).
- [ ] **Task 1.2**: Xây dựng thanh công cụ mini nổi (**Floating Toolbar**) trong [content.ts](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/entrypoints/content.ts):
  - Lắng nghe sự kiện `selectionchange` và `mouseup`.
  - Hiển thị thanh mini bubble ngay trên đoạn chữ vừa chọn.
  - Cho phép click chọn 4 màu (Vàng, Xanh lá, Xanh lam, Hồng).
- [ ] **Task 1.3**: Bọc đoạn chữ vừa chọn bằng thẻ HTML `<mark class="sidemind-mark sidemind-mark-{color}" data-anno-id="{id}">`.

---

### 📌 Giai đoạn 2: Tự động Khôi phục khi F5 (Re-anchoring Engine) & Ghi chú (Comment)
*Mục tiêu: Vào lại trang web ghi chú vẫn còn nguyên; thêm tooltip hiển thị comment.*

- [ ] **Task 2.1**: Xây dựng thuật toán Re-anchoring Engine trong [content.ts](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/entrypoints/content.ts):
  - Khi trang web load (`DOMContentLoaded`), đọc danh sách annotations của URL hiện tại từ `chrome.storage.local`.
  - Dùng `TreeWalker` quét các `TextNode` trong trang để tìm chính xác đoạn chữ khớp `prefix + exact + suffix`.
  - Tự động bọc lại bằng thẻ `<mark>`.
- [ ] **Task 2.2**: Hỗ trợ đính kèm **Comment (Ghi chú)**:
  - Khi bấm nút 💬 trên thanh bubble, hiện khung popup nhỏ để nhập ghi chú.
  - Lưu ghi chú vào thuộc tính `comment` của annotation.
- [ ] **Task 2.3**: Xây dựng Hover Tooltip trên trang web:
  - Khi người dùng rê chuột vào đoạn highlight: Hiện tooltip nhỏ hiển thị ghi chú, ngày tạo và nút 🗑️ **Xóa highlight này**.

---

### 📌 Giai đoạn 3: Quản lý trong Side Panel & Tích hợp AI
*Mục tiêu: Quản lý ghi chú trong Side Panel, nút xóa toàn bộ theo trang web và hỏi đáp AI.*

- [ ] **Task 3.1**: Thêm mục **"Trang này (N ghi chú)"** trong Side Panel ([App.tsx](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/entrypoints/sidepanel/App.tsx)):
  - Liệt kê các đoạn văn bản đã highlight của trang hiện tại.
  - Bấm vào đoạn highlight trong Side Panel ➔ Tự động cuộn trang web đến đúng vị trí đó (`scrollIntoView`).
- [ ] **Task 3.2**: Thêm nút **"Xóa tất cả ghi chú của trang web này"**:
  - Gọi `clearAnnotationsForUrl(currentUrl)` ➔ Gỡ bỏ ngay lập tức toàn bộ thẻ `<mark>` trên trang web mà không cần F5.
- [ ] **Task 3.3**: Tích hợp AI (Ask AI about Highlights):
  - Nút *"Tóm tắt / Hỏi đáp dựa trên các điểm đã ghi chú"* ➔ Đưa trực tiếp danh sách highlighted chunks vào prompt AI.
- [ ] **Task 3.4**: Viết Unit Test cho module annotations ([src/__tests__/annotations.test.ts](file:///d:/GTVT/Projects/sidemind-chatbot-extension/sidemind/src/__tests__/annotations.test.ts)).

---

## 4. Các Lưu ý Kỹ thuật Quan trọng (Edge Cases & Best Practices)

> [!WARNING]
> **1. Xử lý Nội dung Web bị Sửa đổi hoặc Xóa (Orphaned Annotations & Fuzzy Re-anchoring)**:
> - **Khi nội dung bị sửa nhẹ (đổi từ, sửa chính tả)**: Hệ thống sử dụng thuật toán so khớp mờ (Fuzzy Matching ~80%) để vẫn tự động phát hiện và tô màu lại đoạn văn.
> - **Khi nội dung cũ bị xóa hẳn khỏi bài viết**: 
>   - Tuyệt đối **không tự ý xóa dữ liệu** của người dùng.
>   - `content.ts` sẽ không cố ép tô màu để tránh phá hỏng DOM của trang.
>   - Ghi chú này sẽ được gom vào mục **"⚠️ Ghi chú từ phiên bản trước (Nội dung gốc đã thay đổi/xóa)"** trong Side Panel.
>   - Người dùng vẫn xem lại được trích dẫn cũ, lời bình và có nút 🔄 *Chuyển vị trí mới* hoặc 🗑️ *Xóa bỏ*.

> [!IMPORTANT]
> **2. Chuẩn hóa URL (URL Normalization)**:
> Người dùng vào bài viết qua link Facebook/Google thường có đuôi tracking (ví dụ: `?utm_source=facebook&fbclid=...` hoặc `#heading-2`). Nếu không chuẩn hóa, khi họ vào lại bằng link sạch thì highlight sẽ bị mất. Cần hàm `normalizeUrl` loại bỏ toàn bộ query param rác và hash, giữ nguyên path chuẩn.

> [!NOTE]
> **3. Bôi đen kéo dài qua nhiều thẻ HTML (Cross-node / Multi-element Selection)**:
> Khi người dùng kéo chuột bôi đen xuyên qua 2 thẻ `<p>` hoặc qua các thẻ con `<strong>`, `<em>`, `<span>`:
> - Không bọc 1 thẻ `<mark>` khổng lồ trùm lên tất cả vì sẽ làm hỏng cấu trúc HTML hợp lệ của trang web.
> - Kỹ thuật đúng: Bóc tách Range và bọc từng `TextNode` riêng biệt bằng các thẻ `<mark class="sidemind-mark" data-anno-id="{same_id}">`. Khi click vào bất kỳ thẻ nào trong nhóm đều nhận diện cùng 1 annotation.

> [!TIP]
> **4. Hỗ trợ Single Page Applications (SPA - React, Next.js, Vue, YouTube)**:
> Trên các trang SPA, khi chuyển bài viết thì trình duyệt không reload trang thực sự (`history.pushState` / `popstate`). `content.ts` cần lắng nghe sự kiện đổi URL của SPA để tự động dọn thẻ highlight của bài cũ và nạp ngay highlight của bài mới.

> [!TIP]
> **5. Nội dung Tải chậm & Lazy Loading (Dynamic DOM & MutationObserver)**:
> Các trang web có cơ chế lazy load nội dung khi cuộn xuống. Dùng `MutationObserver` (kèm debounce 250ms) để quan sát khi các đoạn văn bản mới được thêm vào DOM thì tự động quét và khôi phục highlight cho các đoạn xuất hiện muộn.

> [!CAUTION]
> **6. Bảo mật & Chống tấn công XSS (Text Sanitization)**:
> Khi hiển thị lời ghi chú (Comment) của người dùng hoặc trích dẫn văn bản trên tooltip nổi và Side Panel:
> - Luôn sử dụng `textContent` hoặc lọc qua `DOMPurify` để ngăn chặn mã độc Javascript được tiêm vào từ trang web.

> [!NOTE]
> **7. Cô lập CSS (Style Isolation)**:
> Các thẻ `<mark>`, popup bubble và tooltip nổi trong `content.ts` phải dùng tiền tố riêng biệt `sidemind-anno-*` kèm CSS reset (`all: initial` hoặc inline style) để giao diện không bao giờ bị méo mó bởi CSS của trang web gốc.

> [!TIP]
> **8. Hiệu năng & Không làm đơ trình duyệt (Performance)**:
> Thuật toán Re-anchoring chỉ quét các text node trong các thẻ chứa nội dung chính (`article`, `main`, `.content`, `body`), tránh quét sâu vào `nav`, `footer`, `script` để thời gian khôi phục đạt **< 30ms**, không làm giật lag khi cuộn trang.
