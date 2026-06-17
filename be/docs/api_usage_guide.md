# Hướng dẫn Sử dụng API & Danh sách Tài khoản Kiểm thử (API Usage & Test Accounts Guide)

Tài liệu này cung cấp danh sách tài khoản kiểm thử đã được nạp sẵn (seed data) và hướng dẫn chi tiết cách gọi, kiểm thử các API của hệ thống **RAMP UP** bằng Postman hoặc cURL.

---

## 1. Danh sách Tài khoản Kiểm thử (Test Accounts)

Tất cả các tài khoản dưới đây đã được cấu hình mật khẩu mặc định là: **`rampup123`** để phục vụ việc kiểm thử qua môi trường HTTP cục bộ và trực tuyến.

| Tên người dùng | Địa chỉ Email | Mật khẩu | Vai trò (Role) | Chức năng chính |
| :--- | :--- | :---: | :---: | :--- |
| **Admin Glinteco** | `admin@glinteco.com` | `rampup123` | `ADMIN` | Quản trị viên, chấm điểm bài tập, quản lý Lớp học (Cohorts). |
| **Alice Nguyen** | `alice@glinteco.com` | `rampup123` | `LEARNER` | Học viên (đã được liên kết vào Cohort Batch 1, có tiến trình học tập sẵn). |
| **Bob Tran** | `bob@glinteco.com` | `rampup123` | `LEARNER` | Học viên (đang trong quá trình onboarding). |

---

## 2. Quy trình Xác thực & Lấy mã JWT (Authentication Flow)

Để gọi được các API cần bảo mật, trước hết bạn cần đăng nhập bằng Email và Mật khẩu để lấy mã `accessToken` (JWT).

### Bước 1: Gọi API Đăng nhập (Login)
* **API Endpoint**: `POST /api/v1/auth/login`
* **JSON Payload (Body)**:
  ```json
  {
    "email": "admin@glinteco.com",
    "password": "rampup123"
  }
  ```
* **Câu lệnh cURL mẫu**:
  ```bash
  curl -X POST https://be-teal-tau.vercel.app/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@glinteco.com", "password": "rampup123"}'
  ```
* **Dữ liệu phản hồi mong đợi (Response)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "d7a46f25-83e8-..."
  }
  ```

### Bước 2: Đính kèm mã Access Token vào các API tiếp theo
Với tất cả các API được bảo vệ (ví dụ: lấy thông tin cá nhân `/auth/me`, xem lộ trình `/tracks`), bạn bắt buộc phải đính kèm Header sau:
* **Key**: `Authorization`
* **Value**: `Bearer <mã_accessToken_của_bạn>`

* **Ví dụ cURL kiểm tra thông tin cá nhân**:
  ```bash
  curl -X GET https://be-teal-tau.vercel.app/api/v1/auth/me \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn..."
  ```

---

## 3. Các API Nghiệp vụ chính & Payload Kiểm thử (Core APIs)

### 3.1. Phân hệ Học tập (Tracks & Lessons)
Cho phép học viên truy cập danh sách lộ trình học tập, tài liệu học tập của mình.

#### Lấy danh sách Lộ trình học (Tracks)
* **Quyền hạn**: Mọi người dùng đã đăng nhập (`LEARNER` hoặc `ADMIN`).
* **API Endpoint**: `GET /api/v1/tracks`
* **cURL mẫu**:
  ```bash
  curl -X GET https://be-teal-tau.vercel.app/api/v1/tracks \
    -H "Authorization: Bearer <token>"
  ```

---

### 3.2. Phân hệ Nộp bài (Submissions)
Học viên nộp bài tập qua Pull Request GitHub, Admin xem danh sách chờ và thực hiện duyệt bài.

#### Học viên nộp bài tập (Submit Exercise)
* **Quyền hạn**: Học viên (`LEARNER`).
* **API Endpoint**: `POST /api/v1/exercises/:id/submissions`
* **Dữ liệu gửi lên**:
  ```json
  {
    "prUrl": "https://github.com/phuongkt-glinteco/glinteco-e-learning-fe/pull/42"
  }
  ```
* **cURL mẫu (ví dụ với exercise có ID `ex-10` đã seed)**:
  ```bash
  curl -X POST https://be-teal-tau.vercel.app/api/v1/exercises/ex-10/submissions \
    -H "Authorization: Bearer <token_cua_alice>" \
    -H "Content-Type: application/json" \
    -d '{"prUrl": "https://github.com/phuongkt-glinteco/glinteco-e-learning-fe/pull/42"}'
  ```

#### Admin phê duyệt bài tập (Approve Submission)
* **Quyền hạn**: Quản trị viên (`ADMIN`).
* **API Endpoint**: `POST /api/v1/submissions/:id/approve`
* **Dữ liệu gửi lên**:
  ```json
  {
    "comment": "Mã nguồn sạch, viết unit test đầy đủ. Duyệt!"
  }
  ```
* **cURL mẫu (ví dụ duyệt bài nộp có ID `sub-1`)**:
  ```bash
  curl -X POST https://be-teal-tau.vercel.app/api/v1/submissions/sub-1/approve \
    -H "Authorization: Bearer <token_cua_admin>" \
    -H "Content-Type: application/json" \
    -d '{"comment": "Mã nguồn sạch, viết unit test đầy đủ. Duyệt!"}'
  ```

#### Admin yêu cầu sửa đổi bài tập (Request Changes)
* **Quyền hạn**: Quản trị viên (`ADMIN`).
* **API Endpoint**: `POST /api/v1/submissions/:id/request-changes`
* **Dữ liệu gửi lên**:
  ```json
  {
    "comment": "Vui lòng tối ưu lại vòng lặp ở dòng 42."
  }
  ```
* **cURL mẫu**:
  ```bash
  curl -X POST https://be-teal-tau.vercel.app/api/v1/submissions/sub-1/request-changes \
    -H "Authorization: Bearer <token_cua_admin>" \
    -H "Content-Type: application/json" \
    -d '{"comment": "Vui lòng tối ưu lại vòng lặp ở dòng 42."}'
  ```

---

### 3.3. Phân hệ Lớp học (Cohorts)
Chỉ dành cho Admin thiết lập và điều hành các đợt lớp học.

#### Admin tạo mới Lớp học (Create Cohort)
* **Quyền hạn**: Quản trị viên (`ADMIN`).
* **API Endpoint**: `POST /api/v1/cohorts`
* **Dữ liệu gửi lên**:
  ```json
  {
    "name": "RAMP UP 2026 - Batch 2",
    "targetRampDays": 45
  }
  ```
* **cURL mẫu**:
  ```bash
  curl -X POST https://be-teal-tau.vercel.app/api/v1/cohorts \
    -H "Authorization: Bearer <token_cua_admin>" \
    -H "Content-Type: application/json" \
    -d '{"name": "RAMP UP 2026 - Batch 2", "targetRampDays": 45}'
  ```
