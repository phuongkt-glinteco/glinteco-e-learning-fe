# FE Need API Audit

> Cập nhật ngày 30/06/2026. Chỉ giữ các mục còn cần xử lý/verify.

## Còn cần làm
- Thiếu backend contract cho learner exercise assignment/progress. API hiện tại chỉ có submission flow, yêu cầu PR URL và chuyển thẳng sang `submitted`, nên không thể persist trạng thái `in_progress` khi learner bấm `Start Exercise`.
## Backend gap: Assignment và tiến độ Exercise của learner

Vấn đề hiện tại:
- FE cần lưu trạng thái khi learner bấm `Start Exercise`: từ `not_started` sang `in_progress`.
- API hiện tại chỉ có exercise catalog + trạng thái bài nộp của learner.
- Trạng thái exercise hiện đang dựa trên `Submission.status`: `pending | submitted | changes | approved | rejected`.
- Chưa có model/API riêng cho việc admin/mentor assign exercise cho learner/cohort.
- Chưa có endpoint để learner bắt đầu exercise mà không cần nộp PR URL.
- `POST /api/v1/exercises/{id}/submissions` yêu cầu `prUrl` và chuyển thẳng sang `submitted`, nên không thể dùng endpoint này cho hành động Start Exercise.

Backend cần bổ sung:
- Model assignment/progress cho learner exercise.
- Admin/Mentor có thể assign exercise cho learner hoặc cohort.
- Chỉ learner được assign mới thấy exercise trong `My Exercises` và truy cập được detail.
- Endpoint start exercise, ví dụ:
  - `POST /api/v1/exercises/{id}/start`
  - hoặc `PATCH /api/v1/learner/exercises/{id}/start`
- Endpoint start nên idempotent và chuyển trạng thái:
  - `not_started -> in_progress`
- Response nên trả learner-specific exercise/progress:
  - `exerciseId`
  - `userId`
  - `status: not_started | in_progress | submitted | changes | approved | rejected`
  - `assignedAt`
  - `startedAt`
  - `submittedAt`
  - `reviewedAt`
  - `prUrl`
  - `reviewNote`

Luồng mong muốn:
- Admin/Mentor assign exercise cho learner/cohort.
- Learner thấy exercise ở `My Exercises` với trạng thái `not_started`.
- Learner bấm `Start Exercise`, backend lưu `in_progress`.
- Sau đó learner submit GitHub PR URL, status chuyển sang `submitted`.
- Mentor/Admin review, status chuyển sang `approved`, `changes`, hoặc `rejected`.

FE impact sau khi backend hỗ trợ:
- `/exercises` nên lấy danh sách assigned exercises của learner, không phải toàn bộ catalog.
- Exercise detail nên trả 403/404 nếu learner chưa được assign.
- Nút `Start Exercise` gọi endpoint start, sau đó refetch detail/list.
- Form submit PR chỉ unlock khi status là `in