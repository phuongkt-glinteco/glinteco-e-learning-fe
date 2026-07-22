# Frontend UI, Component & Icon Standards

Tài liệu này quy định tiêu chuẩn về giao diện, tái sử dụng component và icon cho toàn bộ dự án Frontend (`fe/`).

---

## 1. Tiêu chuẩn về Icon (`Icon Hierarchy`)

Dự án sử dụng nhiều thư viện icon. Để bảo đảm tính nhất quán về đường nét thiết kế, tuân thủ thứ tự ưu tiên sau:

### 1.1. Primary Icon Library: `lucide-react`
- **Bắt buộc ưu tiên sử dụng** `lucide-react` cho mọi nút bấm, điều hướng, form, card, action bar và các component UI tiêu chuẩn.
- Lý do: Đồng bộ 100% style nét vẽ với bộ component `shadcn` đang dùng.

```tsx
// Chuẩn
import { Edit2, Trash2, Plus, Save } from 'lucide-react';
```

### 1.2. Secondary / Extended Library: `@iconify/react`
- **Chỉ sử dụng** khi icon cụ thể đặc thù (ví dụ: logo brand chuyên sâu, icon học tập đặc thù) không tồn tại trong `lucide-react`.

```tsx
import { Icon } from '@iconify/react';
```

### 1.3. Nghiêm cấm (`Prohibited`)
- **Không sử dụng** Google Material Icons dạng text (`material-symbols-outlined`), icon fonts tùy tiện, hoặc chèn SVG hardcode lộn xộn trong JSX.

---

## 2. Tiêu chuẩn Tái sử dụng Component (`Shadcn / Puck / Dnd-Kit`)

### 2.1. Tối đa hóa tái sử dụng
- **Không viết custom HTML/CSS từ đầu** nếu component hoặc pattern tương tự đã tồn tại trong `shadcn/ui`, `@measured/puck`, hoặc `@dnd-kit`.
- Tận dụng các primitive từ `radix-ui` và mẫu layout có sẵn từ các thư viện open-source uy tín.

### 2.2. Map Theme với `next-themes`
- Khi tích hợp hoặc chỉnh sửa mẫu giao diện từ bên ngoài, bắt buộc chuyển đổi màu sắc hardcode sang hệ thống **CSS Variables Tokens** của dự án (`next-themes`):
  - Nền (Backgrounds): `bg-background`, `bg-surface`, `bg-surface-container`, `bg-surface-container-lowest`.
  - Chữ (Text): `text-foreground`, `text-muted-foreground`, `text-primary`.
  - Viền & Phân cách (Borders): `border-border`, `divide-border`.
- Đảm bảo giao diện hoạt động hoàn hảo trên cả chế độ **Light Mode** và **Dark Mode**.

---

## 3. Tiêu chuẩn UX tránh trùng lặp thao tác

- **1 Chức năng = 1 Giao diện chính:** Không để 2 bộ điều khiển (controls) hiển thị cố định dài hạn cùng thực hiện 1 thao tác.
- Nếu cần thao tác nhanh (shortcuts): Dùng phím tắt, floating trigger thu gọn (như bottom bar collapsed trigger), hoặc modal/dialog popup thay vì chiếm dụng diện tích trang cố định.
