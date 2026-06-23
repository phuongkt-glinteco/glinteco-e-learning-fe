# Markdown Syntax Guide

Tài liệu này mô tả toàn bộ cú pháp Markdown đặc biệt được hỗ trợ bởi Frontend Learning Platform. Dùng để soạn thảo nội dung bài học (Lesson).

---

## Frontmatter (Metadata)

Đặt ở đầu file Markdown, giữa hai dòng `---`. Dùng để khai báo thông tin bài học.

```yaml
---
duration: 35 min
difficulty: Beginner
xp: 120 XP
subtitle: Learn modern React
---
```

| Field | Mô tả | Ví dụ |
|-------|-------|-------|
| `duration` | Thời lượng | `35 min`, `1 hour` |
| `difficulty` | Độ khó | `Beginner`, `Intermediate`, `Advanced` |
| `xp` | Kinh nghiệm | `120 XP` |
| `subtitle` | Mô tả ngắn | `Learn modern React` |

---

## Headings

```markdown
# Heading 1 (tiêu đề chính)
## Heading 2 (section)
### Heading 3 (subsection)
```

---

## Inline Formatting

```markdown
**Bold text**
*Italic text*
<u>Underline text</u>
`inline code`
```

---

## Links

```markdown
[Internal link](/react-basics)
[External link](https://react.dev)
```

- Link nội bộ (relative): hiển thị icon `arrow_forward`
- Link ngoài (http/https): mở tab mới, hiển thị icon `open_in_new`

---

## Images

```markdown
![Alt text](image-url.jpg)
```

Hiển thị dạng card với viền, aspect ratio 16:9. Nếu có `alt` text thì hiển thị dưới dạng caption.

---

## Lists

```markdown
- Unordered item
- Another item

1. Ordered item
2. Next item

- [ ] Task chưa hoàn thành
- [x] Task đã hoàn thành
```

---

## Tables

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
```

---

## Blockquotes

```markdown
> Nội dung trích dẫn hoặc ghi chú quan trọng.
```

---

## Code Blocks

### Generic Code (JavaScript, TypeScript, JSX, TSX, CSS, HTML, JSON)

````markdown
```ts
const message: string = "Hello";
```
````

Hiển thị: nền tối (`#1c1b1d`), syntax highlighting cơ bản, copy button.

Các ngôn ngữ hỗ trợ: `ts`, `js`, `tsx`, `jsx`, `css`, `html`, `json`.

### File Display

````markdown
```tsx title="Button.tsx"
export function Button() {
  return <button>Click</button>;
}
```
````

Hiển thị: có header hiển thị tên file, nền trắng, code bên trong.

### Terminal Commands

````markdown
```bash
npm install react
pnpm dev
```
````

Hỗ trợ: `bash`, `shell`. Hiển thị: theme primary container, prompt `$` màu xanh.

### Folder Structure

````markdown
```tree
src/
├── components/
│   ├── Header.tsx
│   └── Sidebar.tsx
├── styles/
└── App.tsx
```
````

Hiển thị: cấu trúc thư mục với icon folder/file.

---

## Callout Blocks

Dùng cú pháp `:::type` ... `:::` để tạo các khối đặc biệt.

### Info

```markdown
:::info
Đây là thông tin quan trọng cần lưu ý.
:::
```

### Objective (Mục tiêu bài học)

```markdown
:::objective
- Hiểu về JSX
- Nắm được Components
- Props trong React
:::
```

### Prerequisites (Kiến thức yêu cầu)

```markdown
:::prerequisites
- HTML cơ bản
- CSS cơ bản
- JavaScript ES6
:::
```

### Exercise (Bài tập)

```markdown
:::exercise
Xây dựng một Todo App sử dụng React.
:::
```

### Challenge (Bài tập nâng cao)

```markdown
:::challenge
Implement drag and drop functionality.
:::
```

### Summary (Tổng kết)

```markdown
:::summary
Trong bài học này bạn đã học về JSX, Components, và Props.
:::
```

---

## Tabs

```markdown
:::tabs

@tab JavaScript
console.log("Hello");

@tab TypeScript
console.log("Hello" as string);

:::
```

Dùng để chuyển đổi giữa nhiều phiên bản code (JS/TS, npm/yarn, React/Vue...).

---

## Details / Accordion

```markdown
:::details Why React?
React is a declarative, efficient, and flexible JavaScript library for building user interfaces.
:::
```

Dùng cho nội dung có thể thu gọn/mở rộng (FAQ, giải thích thêm).

---

## Horizontal Rule

```markdown
---
```

Lưu ý: nếu đặt ở đầu file sẽ được hiểu là Frontmatter, không phải horizontal rule.
