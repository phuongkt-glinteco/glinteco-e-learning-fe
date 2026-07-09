# Lesson Canvas Builder (Dual-Renderer Architecture)

Hệ thống **Lesson Canvas Builder** là trình soạn thảo bài học dạng khối nhúng tương tác cao (Block-based Interactive Canvas Editor) được thiết kế cho hệ thống Glinteco E-Learning.

Hệ thống tuân thủ nguyên tắc **Dual-Renderer (Kiến trúc Hiển thị Kép)** và **Strict TypeScript (Không sử dụng `any`)**, đảm bảo tách biệt rõ ràng giữa trải nghiệm của **Giảng viên / Editor** (soạn thảo, kéo thả, chỉnh kích thước) và trải nghiệm của **Người học / Learner** (hiển thị tối ưu, tương tác sao chép mã, thu gọn nội dung, điều hướng mục lục).

---

## 1. Sơ Đồ Kiến Trúc & Cấu Trúc Thư Mục

```text
src/components/features/tracks/canvas-editor/
├── README.md                          # Tài liệu kiến trúc & hướng dẫn sử dụng module này
├── index.ts                           # Cổng xuất (barrel export) toàn bộ API & Component
├── types.ts                           # Strict Types định nghĩa Block, Props, Mode, Viewport (DTO chuẩn từ services/client)
├── blockConverter.ts                  # Bộ chuyển đổi 2 chiều giữa lesson.body (Markdown/JSON) <-> CanvasBlock[]
├── SortableBlockWrapper.tsx           # Khung kéo thả Sortable Dnd-Kit kèm Action Bar nổi
├── BlockRenderer.tsx                  # Bộ điều phối Dual-Renderer (chuyển hướng render giữa Edit Mode & Learner View)
├── LessonCanvasEditor.tsx             # Orchestrator chính quản lý State, DndContext, DragOverlay & Viewport Simulator
├── blocks/
│   ├── editable/                      # Bộ Component dành riêng cho Editor Mode
│   │   ├── EditableContainerBlock.tsx      # Khung Wrapper lồng nhau đệ quy (Recursive Layout Container)
│   │   ├── EditableHeadingBlock.tsx        # Chỉnh sửa Tiêu đề H1/H2/H3 inline
│   │   ├── EditableRichTextBlock.tsx       # Textarea tự động co giãn chiều cao
│   │   ├── EditableCalloutBlock.tsx        # Chỉnh sửa Ghi chú với 6 variants sang trọng
│   │   ├── EditableCodeBlock.tsx           # Khung Code/Console kèm tay nắm kéo chỉnh chiều cao (Interactive Height Resizer)
│   │   ├── EditableTableBlock.tsx          # Bảng dữ liệu kèm tay nắm kéo chỉnh độ rộng cột (Column Resizing)
│   │   ├── EditableScrollableAreaBlock.tsx # Vùng cuộn lớn (Scrollable Container) cho bảng biểu kích thước lớn
│   │   └── EditableEmbedBlock.tsx          # Nhúng Tài liệu / Bài tập theo dạng Thẻ liên kết hoặc Khung nhúng
│   └── learner/                       # Bộ Component dành riêng cho Learner View (Không công cụ chỉnh sửa)
│       ├── LearnerContainerBlock.tsx       # Render Wrapper đệ quy với ngữ nghĩa HTML5 chuẩn
│       ├── LearnerHeadingBlock.tsx         # Render Tiêu đề tĩnh kèm Anchor ID tự sinh cho cuộn mục lục
│       ├── LearnerRichTextBlock.tsx        # Render văn bản với typography tối ưu
│       ├── LearnerCalloutBlock.tsx         # Hộp ghi chú trực quan theo variant
│       ├── LearnerCodeBlock.tsx            # Hiển thị Code kèm Nút "Sao chép mã" (One-click Copy Code)
│       ├── LearnerTableBlock.tsx           # Bảng dữ liệu tự cuộn ngang khi màn hình nhỏ
│       ├── LearnerScrollableAreaBlock.tsx  # Khung giới hạn chiều cao cuộn 2 chiều giữ layout trang
│       └── TruncateWrapper.tsx             # Component bọc tự động thu gọn nội dung dài kèm nút "Xem thêm / Thu gọn"
└── toolbar/                           # Thanh công cụ và cơ chế tạo block
    ├── index.ts
    ├── DraggableToolbarItem.tsx       # Mục công cụ hỗ trợ Click tạo nhanh HOẶC Kéo thả tạo Clone thực tế
    └── CanvasBottomToolbar.tsx        # Thanh đáy phân cấp Dropdown (Bố cục Wrapper, Tiêu đề, Ghi chú, Kỹ thuật, Nhúng)
```

---

## 2. Các Thiết Kế Kỹ Thuật Nổi Bật

### A. Strict Typing (Không dùng `any`)
- Toàn bộ thuộc tính block được định nghĩa nghiêm ngặt qua kiểu dữ liệu hợp nhất `CanvasBlockProps` (`HeadingBlockProps`, `CalloutBlockProps`, `CodeBlockProps`, ...).
- Các kiểu dữ liệu tham chiếu bài học, tài liệu, bài tập được import trực tiếp từ **DTO tự động sinh của backend** (`DocumentResponseDto`, `ExerciseSummaryDto` trong `@/services/client`).

### B. Dual-Renderer (Phân tách Editor vs. Learner View)
| Tính năng | Chế độ Soạn thảo (`Edit Mode`) | Chế độ Người học (`Learner View / Preview`) |
| :--- | :--- | :--- |
| **Kéo thả sắp xếp (`Sortable`)** | Có (Drag Handle, Move Up/Down) | **Không** (hoàn toàn loại bỏ khung bọc sửa) |
| **Chỉnh chiều cao Console (`Code height`)** | Kéo tay nắm dưới đáy khung code (`120px - 800px`) | **Không** (hiển thị chiều cao cố định theo cấu hình) |
| **Chỉnh độ rộng cột Bảng (`Table col width`)**| Kéo tay nắm cạnh phải header (`100px - 600px`) | **Không** (bảng tĩnh có cuộn ngang an toàn) |
| **Tương tác Sao chép Code** | Không kích hoạt thao tác copy | **Có** (Nút Sao chép 1 chạm có phản hồi "Đã chép!") |
| **Thu gọn nội dung dài (`Truncate`)** | Cấu hình ngưỡng chiều cao (`truncateHeight`) | **Có** (Hiển thị gradient che phủ + Nút Xem thêm/Thu gọn) |
| **Điều hướng Mục lục (`Anchor ID`)** | Không | **Có** (Mỗi Heading tự sinh `id` duy nhất từ nội dung) |

### C. Hệ Thống Wrapper / Container Lồng Nhau Đệ Quy & Ẩn Hoàn Toàn Viền Block
- **Bố cục cây đệ quy (`Recursive HTML Tree`)**:
  - Block type `container` cho phép chứa mảng `children?: CanvasBlock[]`, hỗ trợ lồng nhau không giới hạn độ sâu.
  - Hỗ trợ đầy đủ thẻ HTML5 ngữ nghĩa: `<section>`, `<article>`, `<header>`, `<main>`, `<aside>`, `<div>`.
  - Tùy chọn sắp xếp con bên trong theo **Flexbox Dọc (`flex-col`)**, **Flexbox Ngang (`flex-row wrap`)**, **Lưới 2 cột (`grid-2`)**, hoặc **Lưới 3 cột (`grid-3`)** kèm kiểm soát khoảng cách (`gap`) và khoảng đệm (`padding`).
  - Hỗ trợ tự động chuyển thành vùng cuộn Scrollable Area khi cấu hình `maxHeight`.
- **Ẩn tuyệt đối khung viền khi không được chọn (`Zero-Visual-Clutter`)**:
  - Khi một block ở trạng thái bình thường (không chọn), khung wrapper `SortableBlockWrapper` có `border-0 bg-transparent p-0 my-1`, giúp tài liệu liền mạch 100% như văn bản đọc thuần túy.

### D. Drag & Drop Clone từ Thanh Công Cụ Đáy
- Thanh công cụ đáy (`CanvasBottomToolbar`) chia thành **6 nhóm Dropdown (`Popover`)**:
  - **Bố cục Wrapper (`Container`)**: Khung dọc `<section>`, Khung lưới 2 cột, Khung lưới 3 cột, Vùng cuộn Scrollable Area.
  - **Tiêu đề (`Heading`)**: H1, H2, H3.
  - **Ghi chú (`Callout`)**: Info, Objective, Prerequisites, Exercise, Challenge, Summary.
  - **Kỹ thuật (`Technical`)**: Code Block (TS, JS, Python...), Terminal Command.
  - **Bảng biểu (`Table`)**: Table cơ bản.
  - **Nhúng (`Embeds`)**: Document Embed, Exercise Embed.
- **Trải nghiệm UX Kéo Thả Trực Quan (`Drag Overlay Clone`)**:
  - Khi người dùng nắm kéo một mục từ Dropdown vào vùng Canvas, hệ thống render một **bản sao component thực tế (Clone Block Preview)** theo con trỏ chuột.
  - Khi chọn một Container, việc bấm thêm block mới từ thanh công cụ sẽ thông minh chèn trực tiếp vào bên trong Container đó (`children`).

---

## 3. Logic Chuyển Đổi Dữ Liệu (`blockConverter.ts`)

Trường `lesson.body` trong cơ sở dữ liệu có thể chứa **Markdown truyền thống** (từ hệ thống cũ) hoặc **JSON Blocks hiện đại** (từ Canvas Builder). Bộ converter xử lý thông minh cả 2 trường hợp:

1. **`parseBodyToBlocks(body)`**:
   - Thử parse JSON trước: Nếu là cấu trúc `CanvasBlock[]`, hoàn trả trực tiếp.
   - Nếu là chuỗi Markdown truyền thống: Tự động phân tích cú pháp `# Heading`, `> [!variant]` Callout, ````Code block````, `| Table |` và `Paragraph` để dựng thành `CanvasBlock[]` tương thích hoàn toàn.
2. **`serializeBlocksToBody(blocks)`**:
   - Chuẩn hóa và tuần tự hóa mảng `CanvasBlock[]` thành chuỗi JSON gọn gàng để lưu trữ vào trường `body`.
3. **`convertBlocksToMarkdown(blocks)`**:
   - Hỗ trợ xuất (`export`) toàn bộ bài học ra định dạng Markdown tiêu chuẩn.

---

## 4. Hướng Dẫn Tích Hợp & Sử Dụng

Sử dụng component `LessonCanvasEditor` bên trong trang chỉnh sửa bài học:

```tsx
import React, { useState } from 'react';
import {
  LessonCanvasEditor,
  parseBodyToBlocks,
  serializeBlocksToBody,
  type CanvasBlock,
} from '@/components/features/tracks/canvas-editor';

export function EditLessonExample({ initialBody }: { initialBody: string }) {
  const [blocks, setBlocks] = useState<CanvasBlock[]>(() =>
    parseBodyToBlocks(initialBody)
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleSave = async () => {
    const serializedBody = serializeBlocksToBody(blocks);
    // Gửi serializedBody lên API update lesson
  };

  return (
    <LessonCanvasEditor
      initialBlocks={blocks}
      onChangeBlocks={setBlocks}
      selectedBlockId={selectedBlockId}
      onSelectBlock={setSelectedBlockId}
    />
  );
}
```

---

## 5. Tổ Hợp Phím Tắt & Điều Hướng Bàn Phím (Keyboard UX)

- **Chuyển đổi kiểu văn bản luân phiên (`Ctrl + B`)**:
  - Nhấn `Ctrl + B` (hoặc `Cmd + B`) để xoay vòng luân phiên giữa 4 dạng: `Văn bản thường (Paragraph) -> Tiêu đề H1 -> Tiêu đề H2 -> Tiêu đề H3 -> Văn bản thường...`.
- **Tạo nhanh khối văn bản mới bên dưới (`Ctrl + Enter`)**:
  - Nhấn `Ctrl + Enter` tại bất kỳ block nào để chèn ngay một đoạn văn bản trống liền kề bên dưới.
- **Điều hướng mượt mà bằng mũi tên liên thông Header & Canvas (`Arrow Up / Arrow Down`)**:
  - Từ trường **Mô tả bài học (Lesson Header)** bấm `Arrow Down`: tự động nhảy xuống khối đầu tiên của Canvas.
  - Từ **khối đầu tiên của Canvas (Block 0)** bấm `Arrow Up` khi ở dòng đầu: tự động nhảy lên trường Mô tả / Tiêu đề của Header bài học.
  - Với khối nhiều dòng (`EditableRichTextBlock`):
    - Khi con trỏ ở dòng đầu tiên bấm `Arrow Up`: chuyển focus lên block liền trước (hoặc Header).
    - Khi con trỏ ở dòng cuối cùng bấm `Arrow Down`: chuyển focus xuống block liền sau.

---

## 6. Kế Hoạch Bàn Luận & Phát Triển Tiếp Theo: Sortable Wrapper Group Wrapping (`hbox`, `vbox`, `grid`)

Theo định hướng kiến trúc nâng cao:
- **Wrapper như một tính năng chung của Sortable Wrapper**:
  - Thay vì xem Wrapper là một loại block riêng biệt trong thanh công cụ, Wrapper có thể đóng vai trò là tính năng bao bọc (`Group Wrap`) ngay trên thanh thao tác của Sortable Wrapper hoặc khi chọn nhiều phần tử (`Multi-select`).
- **Khối bao bọc linh hoạt (`hbox`, `vbox`, `grid`)**:
  - Khi người dùng chọn một hoặc nhiều block, có thể chọn bọc chúng trong `hbox` (ngang), `vbox` (dọc) hoặc `grid` (lưới).
  - Đối với `grid`: cấu hình số cột (`columns`) hoặc thuộc tính style tùy biến có thể chỉnh trực tiếp trên bảng thuộc tính bên phải (`Inspector`).
  - Các container `hbox`, `vbox`, `grid` này hoàn toàn hỗ trợ Kéo Thả Sắp Xếp (`Sortable`) và thêm phần tử con y hệt như vùng Canvas chính (`Canvas Area`).
