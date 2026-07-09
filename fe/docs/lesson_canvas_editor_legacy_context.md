# Tài liệu Bàn giao Kiến trúc & Logic Trình soạn thảo Bài học (Lesson Canvas Editor Legacy Context Handover)

Tài liệu này tổng hợp toàn bộ cấu trúc dữ liệu, kiến trúc component, logic đệ quy và các quy tắc UX đã được triển khai đầy đủ trong **Lesson Canvas Editor**. Bạn chỉ cần feed tài liệu này vào một cuộc hội thoại mới để Agent tiếp tục làm việc mà không cần context dài trước đó.

---

## 1. Tổng quan Cấu trúc Dữ liệu (`types.ts`)

Mỗi khối trong Canvas được lưu trữ dưới dạng một **`CanvasBlock`** dạng cây (hỗ trợ đệ quy n cấp):

```typescript
export type CanvasBlockType =
  | 'heading'
  | 'paragraph'
  | 'callout'
  | 'code'
  | 'table'
  | 'embed'
  | 'link'
  | 'scrollable-area'
  | 'container';

export type ContainerLayoutMode = 'flex-col' | 'flex-row' | 'grid-2' | 'grid-3';

export interface CanvasBlockProps {
  // Heading props
  level?: 1 | 2 | 3;
  // Paragraph & List props
  listType?: 'bullet' | 'ordered';
  listStart?: number;
  indentLevel?: number;
  // Container / Layout Wrapper props
  semanticTag?: string; // 'div' | 'section' | 'article' | ...
  layoutMode?: ContainerLayoutMode; // HBox ('flex-row'), VBox ('flex-col'), Grid ('grid-2', 'grid-3')
  gap?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  // Preview visibility
  hiddenOnPreview?: boolean;
  [key: string]: unknown;
}

export interface CanvasBlock {
  id: string;
  type: CanvasBlockType;
  props: CanvasBlockProps;
  content: string;
  children?: CanvasBlock[]; // Cho phép chứa các block con đệ quy (khi type === 'container')
}
```

---

## 2. Bản đồ File & Vai trò Component

```
src/components/features/tracks/canvas-editor/
├── LessonCanvasEditor.tsx             # Component chính quản lý state blocksRef/blocks, xử lý DND & các handler đệ quy
├── BlockRenderer.tsx                  # Dispatcher render block theo type & mode ('edit' | 'preview') + bọc SortableBlockWrapper cho block con
├── SortableBlockWrapper.tsx           # Wrapper cung cấp UI khung chọn, handle kéo thả, mini-toolbar (Move Up/Down, Duplicate, Delete, Add below)
├── types.ts                           # Định nghĩa kiểu dữ liệu CanvasBlock, CanvasBlockProps
├── toolbar/
│   ├── CanvasBottomToolbar.tsx        # Thanh công cụ dưới cùng: thêm block, bọc layout (Bố cục Popover), giả lập kích thước
│   └── DraggableToolbarItem.tsx       # Component nút kéo block mẫu vào Canvas
└── blocks/
    ├── editable/
    │   ├── EditableRichTextBlock.tsx  # Paragraph & List item: tự nhận diện "- " (bullet), "1. " (ordered), Tab/Shift+Tab, Enter nhiều dòng
    │   ├── EditableHeadingBlock.tsx   # Heading H1/H2/H3
    │   └── EditableContainerBlock.tsx # Wrapper/Container bọc các block con theo bố cục ngang/dọc/lưới
```

---

## 3. Các Logic UX & Handler Đệ Quy Đã Triển Khai Hoàn Chỉnh

### 3.1. Soạn thảo Paragraph nhiều dòng & Danh sách tự nhận diện (`EditableRichTextBlock`)
- **Tự động nhận diện danh sách**:
  - Gõ `- ` hoặc `* ` hoặc `+ ` ở đầu dòng $\rightarrow$ tự động chuyển `block.props.listType = 'bullet'`.
  - Gõ `1. ` hoặc `a. ` ở đầu dòng $\rightarrow$ tự động chuyển `block.props.listType = 'ordered'`.
- **Logic phím Enter**:
  - **Paragraph thường (`listType === undefined`)**: Phím `Enter` **không bị block** (`preventDefault`), cho phép xuống dòng tự nhiên (`\n`) để gõ nhiều dòng trong cùng một block Paragraph.
  - **Danh sách (`listType = 'bullet' | 'ordered'`)**: Nhấn `Enter` tạo block list item tiếp theo cùng cấp indent (`onInsertParagraphAfter`). Nhấn `Enter` trên dòng rỗng sẽ thoát khỏi danh sách hoặc giảm indent.
- **Thụt lề (Tab / Shift + Tab)**:
  - Nhấn `Tab` tăng `indentLevel` (tối đa cấp 3).
  - Nhấn `Shift + Tab` giảm `indentLevel` (về 0 sẽ thoát danh sách).

### 3.2. Focus và Định danh Root Element (`data-block-id`)
- Tất cả các block (`EditableRichTextBlock`, `EditableHeadingBlock`, `EditableContainerBlock`) đều gắn thuộc tính `data-block-id={block.id}` ngay trên thẻ gốc (`root div`).
- Mọi thao tác thêm mới block (bấm `Enter` trong list, bấm nút `+`, bấm đổi type từ Heading sang Paragraph hay ngược lại) đều gọi hàm focus theo `data-block-id`, đảm bảo con trỏ nhảy đúng vào `textarea` / `input` ngay lập tức.

### 3.3. Thao tác Đệ quy với Block Con trong Container (`updateRecursive`)
- Các hàm quản lý block trong `LessonCanvasEditor.tsx` đều được viết đệ quy để hoạt động chính xác ở **bất kỳ độ sâu nào**:
  - `handleBlockChangeContent`, `handleBlockChangeProps`, `handleBlockChangeContentAndProps`: Cập nhật nội dung/props của block ở bất kỳ cấp độ nào.
  - `handleChangeBlockType`: Đổi loại block (ví dụ Heading $\leftrightarrow$ Paragraph) ở bất kỳ cấp độ nào.
  - `handleInsertChildParagraphAfter`: Chèn block mới ngay phía sau một block con bên trong container.
  - `handleDeleteChildBlock`, `handleDuplicateChildBlock`, `handleMoveChildBlockUp`, `handleMoveChildBlockDown`: Xóa, nhân bản, đổi chỗ block con bên trong container.
  - `handleAddBlock`: Khi đang chọn block con bên trong container, bấm thêm block từ Bottom Toolbar sẽ chèn block mới liền kề phía sau block con đó bên trong container.

### 3.4. Bọc Nhóm (Wrap Layout) & Rã Nhóm (Unwrap)
- **Nút "Bố cục" trên Bottom Bar (`CanvasBottomToolbar`)**:
  - Khi chọn 1 block duy nhất hoặc chọn nhiều block (qua click hoặc `Shift + Click`), mở popover **Bố cục** cho phép bọc chúng vào:
    - **Bọc ngang (HBox / Row - `flex-row`)**
    - **Bọc dọc (VBox / Column - `flex-col`)**
    - **Lưới 2 cột (`grid-2`)** / **Lưới 3 cột (`grid-3`)**
  - Khi chọn vào một container đã bọc, popover cung cấp nút **"Rã nhóm (Unwrap khối này)"** để giải phóng các phần tử con ra ngoài.
  - Khi chưa chọn block nào, popover cho phép tạo mới khung bố cục rỗng.

---

## 4. Hướng dẫn Sử dụng Context này cho Cuộc hội thoại Mới
Khi mở cuộc hội thoại mới, bạn chỉ cần gửi yêu cầu cùng file này hoặc tham chiếu đường dẫn file:
`fe/docs/lesson_canvas_editor_legacy_context.md`

Agent sẽ nắm vững toàn bộ sơ đồ kiến trúc và nguyên tắc xử lý đệ quy/focus đã hoàn thiện để tiếp tục xây dựng các tính năng tiếp theo một cách an toàn và chính xác.
