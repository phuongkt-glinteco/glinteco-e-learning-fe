# QUY CHUẨN ƯỚC LƯỢNG & PHÂN CÔNG CÔNG VIỆC (ESTIMATE CONVENTIONS)
**Dự án:** RAMP UP (Glinteco e-Learning)  
**Phiên bản:** 1.0  
**Ngày cập nhật:** 29/06/2026  

---

## 1. Quy chuẩn Ước lượng (Estimation Conventions)

Bộ quy chuẩn này định nghĩa các mức thời gian tiêu chuẩn cho các đầu việc phát triển giao diện người dùng dựa trên độ phức tạp của từng trang. Mức thời gian được tính bằng **man-days** (ngày làm việc của một lập trình viên).

### 1.1. Trang Danh sách tiêu chuẩn (Standard List Page)
*   **Đặc tả:** Trang hiển thị dữ liệu dạng bảng hoặc lưới, tích hợp đầy đủ:
    *   Thanh tìm kiếm nhanh (Search Input).
    *   Bảng phân trang (Pagination - Client hoặc Server-side).
    *   Bộ lọc đa dạng (Filters: Select dropdowns, Date ranges, Multi-select tags).
    *   Sắp xếp cột dữ liệu (Sorting).
*   **Thời gian tiêu chuẩn:** **2 ngày (2 man-days)** đối với Junior Developer.

### 1.2. Trang Chi tiết kèm Form phức tạp (Detail & Complex Form Page)
*   **Đặc tả:** Trang chi tiết của một đối tượng có các hành động nghiệp vụ phức tạp:
    *   Biểu mẫu nhập liệu lớn (Form) với cơ chế validate chặt chẽ (Zod + React Hook Form).
    *   Hộp thoại tương tác (Dialog/Modals) cho các tác vụ phụ.
    *   Xử lý tải tệp tin (File upload), dán link liên kết (ví dụ: GitHub PR).
    *   Xử lý bất đồng bộ, phản hồi các trạng thái lỗi cụ thể từ API.
*   **Thời gian tiêu chuẩn:** **3 ngày (3 man-days)**.

### 1.3. Trang Cấu hình/Thông tin phụ (Simple/Static Settings Page)
*   **Đặc tả:** Trang chứa các cài đặt cơ bản hoặc hiển thị thông tin tĩnh:
    *   Trang thiết lập ngôn ngữ, chế độ hiển thị (Settings).
    *   Trang hồ sơ cá nhân (Profile) hiển thị thông tin tĩnh & form đổi tên đơn giản.
    *   Trang trợ giúp, hỏi đáp FAQ (Support/Q&A) hiển thị nội dung dạng Accordion.
    *   Giao diện quả chuông thông báo (Notification Popover).
*   **Thời gian tiêu chuẩn:** **1.5 - 2 ngày (1.5 - 2 man-days)**.

---

## 2. Cấu hình Đội ngũ & Phân công vai trò (Team Configuration)

Hệ thống RAMP UP Frontend được triển khai bởi squad bao gồm các thành viên với vai trò và định mức công suất cụ thể như sau:

| Thành viên | Vai trò | Định mức Công suất | Trách nhiệm chính |
| :--- | :--- | :--- | :--- |
| **Hùng** | Backend Lead | **30%** (1.2 days/tuần này) | - Hỗ trợ tích hợp, cấu hình môi trường, Docker, API.<br>- Nghiên cứu và sửa lỗi logic Expired Token & Auth State Sync ngầm.<br>- Phát triển API cập nhật User (BE-1.6). |
| **Phương** | Junior Frontend | **30%** (1.2 days/tuần này) | - Kiểm duyệt FE & hỗ trợ cho team training (chủ yếu).<br>- Tái cấu trúc AppShell thành Server Component (Đã xong).<br>- Không trực tiếp phát triển các task giao diện mới trong tuần này. |
| **Đức Anh** | Intern Frontend | **100%** (4 days/tuần này) | - Phát triển các màn hình đơn giản & trang phụ trợ.<br>- Thiết kế trang Forgot Password, Notification Popover, Support/Q&A Page. |
| **Lâm** | Intern Frontend | **100%** (4 days/tuần này) | - Phát triển các màn hình hiển thị & trang tĩnh.<br>- Thiết kế trang Profile học viên, trang Cài đặt (Settings), trang Loading/Error/Not-Found toàn cục. |

---

## 3. Bảng phân rã & Ước lượng chi tiết các Task trong Sprint này

Dưới đây là danh sách các task phát triển Frontend được cập nhật vào project **RampUp** trên Multica:

| Mã Task | Tên Task & Giao diện | Người thực hiện | Estimate (Days) | Độ ưu tiên |
| :--- | :--- | :--- | :---: | :---: |
| **GLI-20** | FE-1.1: Landing Page & Navigation Routing | Phương | 2 | Cao |
| **GLI-21** | FE-1.2: Giao diện Đăng nhập & Xác thực | (Hoàn thành) | 0 | - |
| **GLI-22** | FE-2.1: Tái cấu trúc AppShell thành Server Component & CRT | Phương | 2 | Cao |
| **GLI-23** | FE-2.2: Dashboard cho Học viên (Learner Dashboard) | Phương | 3 | Cao |
| **GLI-24** | FE-2.3: Dashboard cho Quản trị (Admin Dashboard) | Phương | 3 | Cao |
| **GLI-25** | FE-3.1: Giao diện Learning Tracks & Lessons | Phương | 4 | Cao |
| **GLI-26** | FE-3.2: Giao diện Quản trị Timeline (Curriculum Control) | Phương | 4 | Trung bình |
| **GLI-27** | FE-4.1: Thư viện tài liệu & Phân loại Tags | Phương | 3 | Trung bình |
| **GLI-28** | FE-4.2: Giao diện Quản lý tài liệu cho Admin | Phương | 3 | Trung bình |
| **GLI-29** | FE-5.1: Giao diện Bài tập thực hành & Nộp bài | Phương | 3 | Cao |
| **GLI-30** | FE-5.2: Hàng chờ kiểm duyệt bài tập & Lịch sử review | Phương | 4 | Cao |
| **GLI-31** | FE-6.1: Bảng xếp hạng thi đua (Leaderboard) | Đức Anh | 2 | Thấp |
| **GLI-32** | FE-6.2: Giao diện Quản trị Cohort cho Admin | Phương | 3 | Cao |
| **NEW-01** | FE-1.3: Giao diện Quên mật khẩu & Khôi phục mật khẩu | Đức Anh | 2 | Trung bình |
| **NEW-02** | FE-4.3: Giao diện Quản lý thẻ Tags cho Admin | Lâm | 2 | Trung bình |
| **NEW-03** | FE-7.1: Giao diện Trang cá nhân & Thống kê XP | Lâm | 2 | Thấp |
| **NEW-04** | FE-7.2: Giao diện Quản lý người dùng & Phân quyền | Phương | 3 | Cao |
| **NEW-05** | FE-7.3: Giao diện Tiến độ học tập của Học viên | Lâm | 2 | Thấp |
| **NEW-06** | FE-7.4: Giao diện Thông báo hệ thống & Nhật ký hoạt động | Đức Anh | 2 | Trung bình |
| **NEW-07** | FE-8.1: Giao diện Loading, Error, Not-Found & Trạng thái trống | Lâm | 2 | Trung bình |
| **NEW-08** | FE-9.1: Giao diện Support & Hỏi đáp (FAQ) | Đức Anh | 2 | Thấp |
| **NEW-09** | FE-9.2: Giao diện Thiết lập hệ thống (Settings) | Lâm | 2 | Thấp |
| **NEW-10** | FE-10.1: Triển khai dự án Frontend lên Vercel & CI/CD | Phương | 1 | Cao |
| **BUG-01** | Fix lỗi Expired Token & Auth State Sync ngầm | Hùng / Phương | 1 | Cao |

---

## 4. Mục tiêu & Kế hoạch tuần này (30/06/2026 - 03/07/2026)
*Lưu ý: Thời gian bắt đầu thực hiện tính từ 8:00 AM ngày 30/06/2026.*

### A. Phân bổ công việc chi tiết trong tuần:

1. **Hùng (Công suất thực tế: 1.2 ngày) - Chỉ tập trung Backend:**
   - **GLI-76 (BE-1.6):** API Cập nhật Vai trò và Khóa học của Người dùng (Dành riêng cho Admin - 1 ngày).
     - *Start:* 30/06/2026 (8:00 AM) | *Due:* 01/07/2026 (End of day).
   - *Hùng không trực tiếp tham gia phát triển hay sửa đổi mã nguồn Frontend (FE).*

2. **Phương (Công suất thực tế: 1.2 ngày) - Chủ yếu kiểm duyệt & Deploy:**
   - **GLI-22 (FE-2.1):** Tái cấu trúc AppShell thành Server Component & CRT (Dành cho cả Learner & Admin - Đã hoàn thành).
   - **GLI-74 (FE-10.1):** Triển khai dự án Frontend lên Vercel & Cấu hình CI/CD (Hệ thống/Cả hai - 1 ngày).
     - *Start:* 30/06/2026 (8:00 AM) | *Due:* 01/07/2026 (End of day).
   - **Review code & kiểm duyệt FE cho team training (30% công suất):** Duy trì liên tục suốt tuần.

3. **Đức Anh (Công suất thực tế: 4 ngày) - Phân hệ Learner & Guest:**
   - **GLI-65 (FE-1.3):** Giao diện Quên mật khẩu & Đặt lại mật khẩu (Dành cho khách/Guest - 2 ngày).
     - *Start:* 30/06/2026 (8:00 AM) | *Due:* 01/07/2026 (End of day).
   - **GLI-71 (FE-8.1):** Giao diện Loading, Error, Not-Found & Trạng thái trống (Dành cho cả Learner & Admin - 2 ngày).
     - *Start:* 02/07/2026 (8:00 AM) | *Due:* 03/07/2026 (End of day).

4. **Lâm (Công suất thực tế: 4 ngày) - Phân hệ Admin & Core (Ưu tiên Migration):**
   - **GLI-66 (FE-4.3):** Giao diện Quản lý thẻ Tags cho Admin (Dành riêng cho Admin - 2 ngày).
     - *Start:* 30/06/2026 (8:00 AM) | *Due:* 01/07/2026 (End of day).
   - **GLI-54 (FE-1.1):** Chuyển sang dùng shadcn (Dành cho cả Learner & Admin - 2 ngày).
     - *Start:* 02/07/2026 (8:00 AM) | *Due:* 03/07/2026 (End of day).

### B. Danh sách các task mục tiêu hoàn thành trong tuần này (Độ ưu tiên: Deploy > shadcn > FE/BE còn lại):
- [x] **GLI-22 (FE-2.1):** Tái cấu trúc AppShell thành Server Component & CRT (Dành cho cả Learner & Admin - Đã hoàn thành).
- [ ] **GLI-74 (FE-10.1):** Triển khai dự án Frontend lên Vercel & Cấu hình CI/CD (Hệ thống/Cả hai - Ưu tiên 1).
- [ ] **GLI-54 (FE-1.1):** Chuyển sang dùng shadcn (Dành cho cả Learner & Admin - Ưu tiên 2).
- [ ] **GLI-76 (BE-1.6):** API Cập nhật Vai trò và Khóa học của Người dùng (Dành riêng cho Admin).
- [ ] **GLI-65 (FE-1.3):** Giao diện Quên mật khẩu & Đặt lại mật khẩu (Dành cho khách/Guest).
- [ ] **GLI-71 (FE-8.1):** Giao diện Loading, Error, Not-Found & Trạng thái trống (Dành cho cả Learner & Admin).
- [ ] **GLI-66 (FE-4.3):** Giao diện Quản lý thẻ Tags cho Admin (Dành riêng cho Admin).

---

## 5. Quy trình nghiệm thu (Definition of Done - DoD) bắt buộc

Mọi task phát triển giao diện trước khi kéo sang trạng thái **Done** phải đạt các điều kiện sau:
1.  **Giao diện & Responsive:** Đạt độ hoàn thiện cao, responsive đầy đủ trên cả Mobile (dưới 768px), Tablet, và Desktop.
2.  **shadcn UI & Tailwind v4:** Các component tương tác (Select, Input, Dialog, Table...) được thay thế bằng linh hồn shadcn UI, thừa hưởng chuẩn CSS variables trong `globals.css` để giữ nguyên style retro/CRT.
3.  **Tích hợp Đa ngôn ngữ (i18n):** 100% các nhãn, nhãn thông báo lỗi, tiêu đề cột phải được cấu hình qua `next-intl` (tệp `vi.json` và `en.json`).
4.  **Xác thực dữ liệu (Form Validation):** Các biểu mẫu nhập liệu phải được kiểm tra định dạng qua Zod schema, hiển thị thông báo lỗi inline trực quan màu đỏ.
5.  **Compile & Lints:** Dự án frontend Next.js biên dịch thành công (`pnpm run build`) không có lỗi TypeScript, ESLint hay cảnh báo nghiêm trọng nào.
