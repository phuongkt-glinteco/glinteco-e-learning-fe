# FE API Audit — Support/FAQ

> Cập nhật ngày 20/07/2026. Audit discovery, chưa triển khai code.

## Hiện trạng

Frontend đã gọi API FAQ và support ticket qua generated SDK, nhưng OpenAPI snapshot hiện tại chưa khai báo các endpoint này. Generated SDK vì vậy chưa có các export `faqController*` và `supportTicketsController*`.

## Bằng chứng

- FE callers: `FaqAdminClient.tsx`, `SupportClient.tsx`, `AdminSupportTicketsClient.tsx`, `SupportTicketsClient.tsx`, `TicketThreadView.tsx`.
- `docs/api/openapi.json` không có path `faqs` hoặc `support-tickets`.
- `fe/src/services/client/**` không có generated operation tương ứng.
- Theo typecheck hiện tại: có 16 lỗi Support/FAQ; 2 lỗi Puck không liên quan.

## API backend cần xác nhận

FAQ:

- `GET /api/v1/faqs` — query `category`, `q`.
- `POST /api/v1/faqs` — tạo FAQ.
- `PATCH /api/v1/faqs/{id}` — cập nhật FAQ.
- `DELETE /api/v1/faqs/{id}` — xóa FAQ.

Support ticket:

- `GET /api/v1/support-tickets` — query `status`, `topic`, `q`.
- `POST /api/v1/support-tickets` — tạo ticket.
- `GET /api/v1/support-tickets/{id}` — xem ticket và replies.
- `PATCH /api/v1/support-tickets/{id}/status` — đổi status.
- `POST /api/v1/support-tickets/{ticketId}/replies` — thêm reply.
- `PATCH /api/v1/support-tickets/{ticketId}/replies/{replyId}` — sửa reply.

Mỗi operation cần kiểm tra path, method, request/response schema, bearer auth và role. Learner chỉ được xem/tạo ticket của mình; admin mới được đổi status và quản lý FAQ.

## Blocker và bước tiếp theo

Blocker hiện tại là backend Swagger/OpenAPI chưa có contract cần thiết. Sau khi backend deploy đủ endpoint:

```powershell
cd fe
pnpm run gen:api:remote
& '.\node_modules\.bin\tsc.cmd' --noEmit
```

Cập nhật `docs/api/openapi.json` và `fe/docs/docs.json` từ OpenAPI backend. Không sửa tay `fe/src/services/client/**`. Nếu schema thực tế khác mock, cập nhật normalizer/mock sau khi contract đã được xác nhận.
