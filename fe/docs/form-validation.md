# Frontend Form & Input Validation Standards

Tài liệu này quy định tiêu chuẩn kiểm tra tính hợp lệ dữ liệu nhập (`Input Validation`) cho toàn bộ dự án Frontend (`fe/`).

---

## 1. Tiêu chuẩn Bộ công cụ (`Zod + React Hook Form + Shadcn Form`)

- **Bắt buộc** mọi form nhập liệu hoặc input quan trọng đều phải được quản lý bằng **`react-hook-form`** kết hợp với schema validation của **`zod`** (thông qua `@hookform/resolvers/zod`).
- Sử dụng các component Form chuẩn từ `shadcn/ui` (`<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`) để hiển thị trạng thái lỗi nhất quán.

---

## 2. Tiêu chuẩn cho Trường Số (`Strict Numeric Validation`)

Để chấm dứt lỗi nhập chữ vào ô số hoặc nhập số âm vào ô yêu cầu số dương, tuân thủ nghiêm ngặt 2 lớp bảo vệ:

### 2.1. Lớp UI Input (`UI Guard`)
- Khi sử dụng `<Input>`, bắt buộc khai báo `type="number"` cùng thuộc tính `min` (ví dụ: `min={1}` hoặc `min={0}`) nhằm ngăn chặn thao tác gõ ký tự chữ trên trình duyệt/bàn phím di động.
- Với các trường có số lượng mốc cố định (như `estimatedTime` theo phút), ưu tiên sử dụng **Select Dropdown** thay vì input tự do.

### 2.2. Lớp Zod Schema (`Schema Guard`)
- Bắt buộc ép kiểu (`coerce`) và kiểm tra giá trị số chặt chẽ trong Zod:
  - **Số nguyên dương (Ví dụ: `order`, `xp`, `durationMinutes` > 0):**
    ```ts
    order: z.coerce
      .number({ invalid_type_error: t('invalidNumber') })
      .int({ message: t('mustBeInteger') })
      .positive({ message: t('mustBePositive') })
    ```
  - **Số không âm (Ví dụ: giá tiền $\ge 0$):**
    ```ts
    price: z.coerce
      .number({ invalid_type_error: t('invalidNumber') })
      .min(0, { message: t('cannotBeNegative') })
    ```

---

## 3. Tiêu chuẩn Đa ngôn ngữ cho Lỗi Validate (`i18n Validation Messages`)

- **Nghiêm cấm** hardcode thông báo lỗi bằng tiếng Anh hay tiếng Việt trực tiếp trong Zod Schema mà không qua hệ thống dịch.
- Mọi thông báo lỗi (`message`, `invalid_type_error`, `required_error`) **bắt buộc phải được dịch thông qua `next-intl`** (`useTranslations('ValidationErrors')` hoặc truyền t-function vào schema factory).
- Luôn đảm bảo cập nhật đồng thời các key lỗi mới ở cả hai file `fe/messages/vi.json` và `fe/messages/en.json`.

---

## 4. Ví dụ Chuẩn (`Standard Form Pattern`)

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';

export function LessonOrderForm() {
  const t = useTranslations('ValidationErrors');

  const schema = z.object({
    title: z.string().min(1, { message: t('required') }),
    order: z.coerce
      .number({ invalid_type_error: t('invalidNumber') })
      .int({ message: t('mustBeInteger') })
      .positive({ message: t('mustBePositive') }),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', order: 1 },
  });

  // ... render shadcn Form
}
```
