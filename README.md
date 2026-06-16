# RAMP UP — Engineering Onboarding Portal (Glinteco e-Learning)

**RAMP UP** là cổng thông tin đào tạo nội bộ gamified dành cho các kỹ sư mới gia nhập Glinteco. Dự án cung cấp một lộ trình học tập trực quan thông qua các track bài học, bài tập thực hành tích hợp GitHub PR và hệ thống tích lũy điểm kinh nghiệm (XP) tăng cấp.

---

## 🚀 Tính năng nổi bật

* **Public Landing Page:** Trang giới thiệu công cộng cho khách vãng lai/kỹ sư mới về quy trình hoạt động, xem trước lộ trình học (Curriculum Preview) và thống kê hiệu suất thực tế.
* **Curriculum Timeline:** Lộ trình học tập trực quan theo dạng timeline (timeline stepper) giúp kỹ sư mới nắm được từng chặng onboarding.
* **GitHub Integration:** Nộp bài tập thực hành bằng cách dán link GitHub PR, tự động đồng bộ sang hàng đợi chấm bài (Review Queue) của Admin.
* **Gamification & Leaderboard:** Học viên tích lũy XP khi hoàn thành bài học/bài tập, tăng Level, duy trì Day Streak hoạt động hàng ngày và tham gia Bảng xếp hạng vinh danh thi đua học tập.
* **Slack & Email Notification:** Tự động gửi thông báo thời gian thực đến học viên và người chấm bài ngay khi có bài nộp mới hoặc khi bài nộp được duyệt/yêu cầu sửa đổi.
* **Submission History & Review Logs:** Cho phép học viên và admin tra cứu lịch sử chi tiết tất cả các phiên bản bài nộp (PR links) và nội dung nhận xét review qua các vòng chấm bài.
* **Admin Cohort & Curriculum Control:** Giao diện cho phép Engineering Manager/Tech Lead quản lý Cohort linh hoạt (khởi tạo, sửa đổi target ramp-up time), theo dõi tiến độ ramp-up trung bình, xuất báo cáo CSV và thay đổi thứ tự timeline bài học.
* **Classic CRT Aesthetic:** Giao diện lấy cảm hứng retro pixel-art/CRT với bộ lọc quét màn hình tùy chọn (CRT Scanline) và hỗ trợ đầy đủ 2 giao diện sáng/tối (Dark/Light mode).

---

## 📂 Cấu trúc Thư mục Dự án

```text
├── app-design/               # Mã nguồn giao diện Prototype (React tĩnh)
│   ├── ui.jsx                # Các component UI cơ bản (Card, Button, Badge...)
│   ├── Shell.jsx             # App Shell (Sidebar, Header, Tìm kiếm)
│   ├── Dashboard.jsx         # Trang Dashboard (Học viên & Quản trị)
│   ├── Tracks.jsx            # Giao diện Lộ trình học & bài học
│   ├── Docs.jsx              # Thư viện tài liệu kỹ thuật
│   ├── Exercises.jsx         # Giao diện bài tập thực hành & Review Queue
│   ├── Login.jsx             # Giao diện xác thực (Email + Google OAuth)
│   └── data.jsx              # Bộ dữ liệu Mock data cho Prototype
├── docs/                     # Bộ tài liệu đặc tả nghiệp vụ & API (BA/SRS)
│   ├── BA_STANDARDS.md       # Quy chuẩn viết tài liệu BA, Story, Gherkin & UAT
│   ├── SRS_RAMP_UP.md        # Đặc tả yêu cầu phần mềm SRS (Sơ đồ trạng thái, NFR, ER)
│   ├── USER_STORIES_RAMP_UP.md # Danh sách chi tiết User Stories & Kịch bản nghiệm thu
│   ├── PROJECT_DOCUMENTATION.md # Đặc tả hệ thống kiến trúc chung & Database model
│   └── API_EXAMPLES.md       # Ví dụ Request/Response chi tiết của các endpoint API
├── Screenshots Overview.html # Thiết kế Canvas bao quát toàn bộ màn hình (Figma-style)
├── Onboarding Portal.html    # Trang thử nghiệm cổng thông tin độc lập
└── README.md                 # Tài liệu hướng dẫn này
```

---

## 📖 Bộ tài liệu Phân tích Nghiệp vụ (BA Documentation)

Để phục vụ quá trình phát triển và kiểm thử dự án, vui lòng tham khảo các tài liệu nghiệp vụ tiêu chuẩn sau:

* 📚 **[BA Standards & Templates](docs/BA_STANDARDS.md):** Hướng dẫn quy trình viết tài liệu, chuẩn hóa User Story, cú pháp Acceptance Criteria (Gherkin) và template UAT Test Case.
* 📝 **[Software Requirements Specification (SRS)](docs/SRS_RAMP_UP.md):** Tài liệu đặc tả kỹ thuật chi tiết các tác nhân (RBAC Matrix), sơ đồ chuyển đổi trạng thái của Lộ trình học (Tracks) & Bài nộp (Submissions), mô hình cơ sở dữ liệu và yêu cầu phi chức năng (NFR).
* 📋 **[Product Backlog & User Stories](docs/USER_STORIES_RAMP_UP.md):** Danh sách đầy đủ các User Stories cốt lõi kèm theo kịch bản nghiệm thu (Given - When - Then) chi tiết cho QC/QA.
* 📅 **[Backend Development Plan](docs/BE_DEVELOPMENT_PLAN.md):** Kế hoạch phân rã Task phát triển backend NestJS theo Sprint cho Squad Team.
* ⚙️ **[API Endpoint Examples](docs/API_EXAMPLES.md):** Đặc tả chi tiết các payload Request/Response JSON mẫu cho toàn bộ các API `/api/v1` của dự án.
* 🏛️ **[Project Architecture Overview](docs/PROJECT_DOCUMENTATION.md):** Tài liệu kỹ thuật chung về kiến trúc hệ thống và luồng tích hợp.

---

## 🛠️ Hướng dẫn Khởi chạy & Xem Thiết kế Giao diện

Do bản thiết kế giao diện (Prototype) được thiết kế chạy trực tiếp dưới dạng client-side tĩnh sử dụng CDN React và Babel standalone, bạn không cần cài đặt các package npm phức tạp để xem giao diện:

### Cách 1: Chạy trực tiếp qua trình duyệt (Đơn giản nhất)
Bạn có thể nhấp đúp trực tiếp để mở các file sau trong trình duyệt Web:
1. **[Screens Overview.html](Screens Overview.html):** Giao diện canvas kiểu Figma, cho phép bạn xem toàn bộ các màn hình (Đăng nhập, Dashboard học viên/admin, Lộ trình, Tài liệu, Bài tập) ở cả 2 chế độ Light/Dark mode, zoom/pan tự do và kéo thả sắp xếp thứ tự các artboard.
2. **[Onboarding Portal.html](Onboarding Portal.html):** Trình mô phỏng giao diện độc lập để tương tác thử nghiệm như một ứng dụng thực tế.

### Cách 2: Chạy qua Web Server cục bộ (Khuyên dùng)
Để tránh các giới hạn bảo mật CORS của trình duyệt đối với giao thức `file://`, bạn nên chạy qua một Web Server tĩnh:
1. Sử dụng extension **Live Server** trong VS Code: Chuột phải vào file `Screens Overview.html` ➔ Chọn `Open with Live Server`.
2. Hoặc sử dụng CLI bất kỳ trong thư mục dự án:
   ```bash
   npx serve .
   # hoặc
   python3 -m http.server 8000
   ```
   Sau đó truy cập đường dẫn cục bộ (ví dụ: `http://localhost:8000/Screens Overview.html`) để trải nghiệm mượt mà nhất.
