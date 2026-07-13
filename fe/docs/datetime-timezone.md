# Frontend Date, Time & Timezone Standards

Tài liệu này quy định tiêu chuẩn xử lý ngày, giờ và Timezone trong dự án Frontend.

---

## 1. Chuẩn Dữ liệu Gốc (Backend & Database)

- Toàn bộ dữ liệu thời gian lưu trong cơ sở dữ liệu và truyền tải qua API Backend **bắt buộc tuân thủ chuẩn UTC ISO 8601** (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- Không lưu timestamp ở giờ địa phương (local time) trong Database.

---

## 2. Chuẩn Hiển thị Frontend (User Configured Timezone)

- Trong màn hình Settings, hệ thống cho phép người dùng/admin cấu hình Timezone (ví dụ: `Asia/Ho_Chi_Minh`, `UTC`, v.v.).
- Khi hiển thị bất kỳ mốc thời gian nào trên giao diện (ngày tạo, hạn nộp, thời gian cập nhật):
  - **Bắt buộc** chuyển đổi từ timestamp UTC sang Timezone đã được cấu hình trong Settings.
  - Sử dụng helper chung hoặc `Intl.DateTimeFormat` với tham số `timeZone` được cấu hình, không dùng `.toLocaleDateString()` mặc định của trình duyệt hay thao tác cắt chuỗi thô sơ.

---

## 3. Nguyên tắc Refactor Từng Phần (`Incremental Scope-by-Scope Refactoring`)

Do việc chuyển đổi Timezone ảnh hưởng đến nhiều màn hình trong hệ thống, dự án áp dụng chiến lược **chuẩn hóa dần theo phạm vi**:

- **Không thực hiện refactor hàng loạt toàn bộ repository cùng lúc** để tránh rủi ro regression.
- **Quy tắc thực thi:** Khi lập trình viên hoặc Agent làm việc trên một tính năng / giao diện cụ thể (ví dụ: `Lesson Editor`, `Tracks Manager`, `Learner Dashboard`):
  1. Kiểm tra các hiển thị thời gian trong phạm vi giao diện đang làm việc.
  2. Cập nhật và chuẩn hóa toàn bộ xử lý thời gian trong **scope chính đó** theo quy chuẩn Timezone này.
  3. Giữ nguyên các màn hình khác chưa thuộc phạm vi task hiện tại.

---

## 4. Quy chuẩn Khoảng thời gian / Thời lượng (`Duration & Estimated Time`)

Các trường thể hiện thời lượng như `estimatedTime` (thời gian ước tính bài học, thời lượng video, v.v.) tuân thủ quy chuẩn sau:

### 4.1. Chuẩn Lưu trữ (`Storage & API Format`)
- **Trường hợp API hiện tại (`estimatedTime: string`):**
  - Chuẩn hóa format lưu trữ là **`"<N> min"`** (ví dụ: `"15 min"`, `"30 min"`, `"45 min"`, `"60 min"`).
  - Không lưu chuỗi tự do, viết tắt tùy tiện hay tiếng Việt hardcode vào DB (ví dụ: cấm lưu `"15m"`, `"15 phút"`, `"nửa tiếng"`).
- **Trường hợp thiết kế API/DB mới:**
  - Khuyến khích sử dụng kiểu số nguyên (**Number**) đại diện cho tổng số phút (`estimatedMinutes: 15`) hoặc giây (`durationSeconds: 900`) để dễ dàng tính tổng thời lượng Track/Course.

### 4.2. Chuẩn Nhập liệu UI (`Input Controls`)
- Trong các màn hình Editor/Form (`Lesson Editor`), sử dụng **Select Dropdown** (chọn mốc chuẩn `5 min`, `15 min`, `30 min`, `45 min`, `60 min`) hoặc **Input Number (phút)** thay vì để người dùng gõ chuỗi tự do.

### 4.3. Chuẩn Hiển thị & Đa ngôn ngữ (`i18n Display`)
- Khi hiển thị ra giao diện người dùng (Learner/Admin), **bắt buộc parse giá trị số `N` và hiển thị qua `next-intl`**:
  - Tiếng Việt (`vi.json`): `"15 phút"`, `"1 giờ 30 phút"`
  - Tiếng Anh (`en.json`): `"15 mins"`, `"1 hr 30 mins"`
- Không hiển thị nguyên gốc chuỗi tiếng Anh `"15 min"` khi người dùng đang ở giao diện tiếng Việt.
