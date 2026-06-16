# KẾ HOẠCH PHÁT TRIỂN BACKEND (BACKEND DEVELOPMENT PLAN)
**Dự án:** RAMP UP (Glinteco e-Learning)  
**Tác giả:** Senior Business Analyst / Product Owner  
**Phiên bản:** 1.0  
**Ngày cập nhật:** 16/06/2026  

---

## 1. Tổng quan Dự án & Kiến trúc Kỹ thuật

Tài liệu này vạch ra lộ trình phát triển hệ thống backend NestJS cho cổng thông tin onboarding **RAMP UP** (Glinteco e-Learning). Kế hoạch được phân rã thành **4 Sprint** (mỗi Sprint kéo dài 2 tuần) dành cho biệt đội phát triển backend (Squad Team) triển khai.

### Công nghệ Lõi (BE Tech Stack):
* **Framework:** NestJS (Node.js) - Cấu trúc module rõ ràng.
* **Database:** PostgreSQL (Lưu trữ quan hệ) + Redis (Cache tags, session & tracking streak).
* **ORM:** TypeORM hoặc Prisma (Hỗ trợ Database Migration).
* **Authentication:** JWT (Access Token & Refresh Token) + Passport.js (Google OAuth 2.0).
* **Validation:** Class-validator & Class-transformer (DTO validation).
* **Notification:** Slack Webhook Integration & NodeMailer (Email).

---

## 2. Phân rã Task theo các Sprint (Sprint Backlog)

### 🏃 SPRINT 1: Cơ sở hạ tầng, Xác thực & Phân quyền (Auth & Core User)
**Mục tiêu:** Thiết lập khung dự án chạy được, thiết kế database và hoàn thành toàn bộ luồng đăng nhập/đăng ký.

* **Task BE-1.1: Khởi tạo Project & Thiết lập Docker Compose**
  * *Mô tả:* Khởi tạo source code NestJS, thiết lập biến môi trường `.env`, cấu hình Docker Compose khởi chạy PostgreSQL và Redis phục vụ local development.
  * *Nghiệm thu:* Ứng dụng NestJS start thành công, kết nối DB không lỗi.
* **Task BE-1.2: Thiết kế Database Schema & TypeORM Entities**
  * *Mô tả:* Lập trình các file entity mô tả bảng cơ sở dữ liệu (`User`, `Cohort`, `Track`, `Lesson`, `TrackProgress`, `Document`, `Tag`, `Exercise`, `Submission`, `SubmissionHistory`). Viết các script di cư (Database Migration) lần đầu.
  * *Nghiệm thu:* Chạy `npm run migration:run` sinh ra đúng các bảng và quan hệ khóa ngoại như mô tả trong SRS.
* **Task BE-1.3: Module Xác thực JWT (Đăng nhập Email/Password)**
  * *Mô tả:* Phát triển API `POST /auth/register` và `POST /auth/login`. Cấp phát cặp token JWT (Access Token & Refresh Token). Xây dựng `AuthGuard` để bảo vệ các API nội bộ.
  * *Nghiệm thu:* Đăng nhập đúng trả về token, đăng nhập sai trả về `401 Unauthorized` kèm định dạng lỗi tiêu chuẩn.
* **Task BE-1.4: Tích hợp Google OAuth 2.0**
  * *Mô tả:* API `POST /auth/google` tiếp nhận ID Token từ frontend, xác thực với Google API, tự động tạo mới tài khoản nếu chưa tồn tại (mặc định gán vai trò `learner`).
  * *Nghiệm thu:* Đăng nhập thành công với tài khoản email công ty và cấp phát JWT token.
* **Task BE-1.5: API Profile & Thống kê cá nhân (Dashboard)**
  * *Mô tả:* API `GET /users/me` và `GET /users/me/stats` tổng hợp XP, Level, Streak và số lượng bài học/bài tập đã hoàn thành của học viên.
  * *Nghiệm thu:* Trả về đúng số liệu tổng hợp của Learner đang đăng nhập.

---

### 🏃 SPRINT 2: Quản lý Lộ trình & Tài liệu (Tracks, Lessons & Docs)
**Mục tiêu:** Cung cấp API lộ trình học timeline và thư viện tài liệu hỗ trợ học viên.

* **Task BE-2.1: API Lộ trình học (Tracks CRUD)**
  * *Mô tả:* API `GET /tracks` trả về danh sách các Track kèm theo tiến độ học của Learner hiện tại (`lessonsCompleted`, `status` in_progress/locked/completed). API CRUD Track dành cho Admin.
  * *Nghiệm thu:* Học viên chỉ xem được, Admin có quyền tạo/sửa/xóa Track.
* **Task BE-2.2: API Sắp xếp lại timeline (Tracks Reordering)**
  * *Mô tả:* API `PATCH /tracks/reorder` dành cho Admin để thay đổi thứ tự sắp xếp (`order`) của toàn bộ các Track trong timeline.
  * *Nghiệm thu:* Payload nhận vào mảng ID các track sắp xếp mới và lưu lại đúng trường `order` trong DB.
* **Task BE-2.3: API Bài học & Logic mở khóa (Lessons CRUD & Mark Complete)**
  * *Mô tả:* API `GET /tracks/:id/lessons` trả về danh sách bài học. API `POST /lessons/:id/complete` cho phép học viên tích hoàn thành bài học.
  * *Nghiệm thu:* Khi tích hoàn thành bài học cuối cùng của Track ➔ Cập nhật trạng thái Track hiện tại sang `completed`, đồng thời tự động chuyển trạng thái Track tiếp theo sang `in_progress`.
* **Task BE-2.4: Thư viện tài liệu & Thẻ phân loại (Documents & Tags)**
  * *Mô tả:* API `GET /documents` hỗ trợ tìm kiếm từ khóa và lọc đa tag (`?q=&tags=NestJS,Architecture`). API bookmark tài liệu `POST /documents/:id/bookmark`.
  * *Nghiệm thu:* Lọc chính xác các tài liệu, hỗ trợ phân trang Cursor.

---

### 🏃 SPRINT 3: Bài tập thực hành, Duyệt bài & Nhật ký lịch sử (Exercises & Submissions)
**Mục tiêu:** Phát triển module bài tập thực hành cốt lõi, cơ chế chấm bài của Admin và lưu vết audit logs bài nộp.

* **Task BE-3.1: API Quản lý bài tập (Exercises CRUD)**
  * *Mô tả:* API `GET /exercises` hiển thị danh sách bài tập kèm trạng thái nộp bài của Learner. Admin CRUD Exercise.
  * *Nghiệm thu:* Hiển thị đầy đủ checklist Objectives (Acceptance Criteria) và Steps của từng bài tập.
* **Task BE-3.2: API Nộp bài tập (Submission POST/PUT)**
  * *Mô tả:* Học viên nộp bài qua `POST /exercises/:id/submissions` bằng link PR GitHub. Chuyển trạng thái sang `submitted`. Cho phép cập nhật link PR qua `PUT /exercises/:id/submissions` (Resubmit) khi có trạng thái `changes`.
  * *Nghiệm thu:* Validate đúng định dạng link GitHub PR, ghi nhận thời gian nộp `submittedAt`.
* **Task BE-3.3: API Hàng chờ chấm điểm (Admin Review Queue)**
  * *Mô tả:* API `GET /submissions` hỗ trợ Admin lọc các bài tập đang có trạng thái `submitted` để chấm điểm.
  * *Nghiệm thu:* Trả về danh sách phân trang Cursor sắp xếp theo thời gian nộp cũ nhất lên trước.
* **Task BE-3.4: Logic chấm điểm bài tập & Audit Logs lịch sử**
  * *Mô tả:* API `POST /submissions/:id/approve` (cộng XP, kiểm tra lên Level) và API `POST /submissions/:id/request-changes` (cập nhật trạng thái bài tập thành `changes`, đính kèm lý do). Tự động ghi lại log chi tiết vào bảng `SubmissionHistory` mỗi lần trạng thái bài tập thay đổi.
  * *Nghiệm thu:* Cộng đúng XP cho học viên khi Approve. Lưu đầy đủ các link PR cũ và nhận xét cũ trong bảng History.

---

### 🏃 SPRINT 4: Tích hợp Hệ thống, Bảng xếp hạng & Search (Integration & Advanced Features)
**Mục tiêu:** Tích hợp kênh chat thông báo, bảng xếp hạng thi đua thời gian thực và đóng gói kiểm thử tích hợp.

* **Task BE-4.1: Tích hợp thông báo Slack Webhook & Email**
  * *Mô tả:* Lắng nghe các sự kiện nộp bài/duyệt bài trong hệ thống (Event Emitter) và gửi tin nhắn tự động thông báo sang Slack của Admin hoặc gửi Email kết quả chấm bài đến hòm thư học viên.
  * *Nghiệm thu:* Nhận được tin nhắn Slack và Email đúng định dạng ngay khi có thay đổi.
* **Task BE-4.2: API Bảng xếp hạng thi đua (Leaderboard)**
  * *Mô tả:* API `GET /leaderboard` xếp hạng học viên theo Level giảm dần ➔ XP giảm dần ➔ Streak giảm dần. Hỗ trợ lọc theo Cohort cá nhân hoặc Toàn công ty (Global).
  * *Nghiệm thu:* Trả về đúng thứ tự xếp hạng học viên, hỗ trợ phân trang Cursor.
* **Task BE-4.3: Quản lý thiết lập Cohort nâng cao cho Admin**
  * *Mô tả:* API CRUD Cohort cho phép Admin quản lý các đợt kỹ sư mới, cấu hình chỉ tiêu `targetRampDays` riêng biệt cho từng Cohort để đo lường hiệu suất.
  * *Nghiệm thu:* Chỉ Admin mới có quyền thao tác trên module Cohort.
* **Task BE-4.4: Tìm kiếm toàn cục ⌘K (Global Search)**
  * *Mô tả:* API `GET /search?q=` tìm kiếm nhanh toàn văn (Full-text search) trên các bảng `Track`, `Document`, `Exercise`.
  * *Nghiệm thu:* Kết quả trả về phân loại rõ ràng theo từng nhóm thực thể.

---

## 3. Kế hoạch Kiểm thử & Đảm bảo Chất lượng (QA/QC Plan)

* **Unit Testing (Kiểm thử đơn vị):** Viết Jest test cases cho toàn bộ các Business Logic Services (đặc biệt là logic mở khóa track tuần tự, chấm điểm bài tập cộng dồn XP và tăng level). Coverage yêu cầu tối thiểu **85%**.
* **Integration Testing (Kiểm thử tích hợp):** Viết e2e test (Supertest) giả lập hành trình học viên từ lúc Đăng nhập ➔ Hoàn thành Lesson ➔ Nộp link bài tập ➔ Admin Approve ➔ Đảm bảo luồng chạy xuyên suốt không lỗi.
* **Security & Authorization Audit:** Viết test cases kiểm duyệt chặt chẽ phân quyền (Role Guard). Đảm bảo học viên không thể gọi các API quản trị (`POST /tracks`, `POST /submissions/:id/approve`...).
