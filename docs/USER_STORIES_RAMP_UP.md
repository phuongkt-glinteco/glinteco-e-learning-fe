# DANH SÁCH USER STORIES & KỊCH BẢN NGHIỆM THU (PRODUCT BACKLOG)
**Dự án:** RAMP UP (Glinteco e-Learning)  
**Tác giả:** Senior Business Analyst  
**Phiên bản:** 1.0  
**Ngày cập nhật:** 16/06/2026  

---

## 1. Phân hệ Xác thực & Session (Authentication)

### US-01: Đăng nhập vào cổng RAMP UP
**As a** Người dùng hệ thống (Learner hoặc Admin)  
**I want to** Đăng nhập bằng Email doanh nghiệp hoặc tài khoản Google OAuth  
**So that** Tôi có thể truy cập an toàn vào không gian làm việc của mình trên hệ thống.

#### Kịch bản nghiệm thu (Acceptance Criteria - AC):

```gherkin
Scenario: Đăng nhập thành công bằng tài khoản Email + Mật khẩu
  Given Người dùng đang ở màn hình Đăng nhập (Login.jsx)
  When Người dùng nhập email "mina@acme.dev" và mật khẩu hợp lệ "hunter2"
  And click nút "Đăng nhập"
  Then hệ thống xác thực thông tin đăng nhập qua API POST /auth/login
  And trả về token Access Token (JWT) và Refresh Token
  And chuyển hướng người dùng về màn hình Dashboard tương ứng với vai trò "learner"

Scenario: Đăng nhập thành công bằng tài khoản Google (OAuth)
  Given Người dùng đang ở màn hình Đăng nhập (Login.jsx)
  When Người dùng click chọn nút "Continue with Google"
  And xác thực tài khoản Google công ty thành công qua popup của Google
  Then hệ thống gửi ID token lên API POST /auth/google để xác thực
  And tự động tạo tài khoản mới nếu chưa tồn tại (vai trò mặc định "learner")
  And cấp phát JWT token và điều hướng về Dashboard

Scenario: Đăng nhập thất bại do thông tin không chính xác
  Given Người dùng đang ở màn hình Đăng nhập (Login.jsx)
  When Người dùng nhập email "wrong@acme.dev" hoặc sai mật khẩu
  And click nút "Đăng nhập"
  Then hệ thống gửi yêu cầu lên API và nhận về mã lỗi 401 Unauthorized
  And giữ nguyên người dùng tại màn hình Đăng nhập
  And hiển thị thông báo lỗi màu đỏ: "Invalid email or password"
```

---

## 2. Phân hệ Trang chủ (Dashboard)

### US-02: Theo dõi tiến độ cá nhân tại Dashboard
**As a** Learner  
**I want to** Xem tổng hợp điểm XP, Level, Streak và trạng thái bài học hiện tại  
**So that** Tôi nắm bắt được tiến độ học tập và có thêm động lực hoàn thành lộ trình onboarding.

#### Kịch bản nghiệm thu (Acceptance Criteria - AC):

```gherkin
Scenario: Hiển thị đúng số liệu thống kê học tập của tôi
  Given Learner đã đăng nhập thành công và đang ở màn hình Dashboard
  When hệ thống tải thông tin từ API GET /users/me/stats
  Then hệ thống phải hiển thị đúng số XP tích lũy (ví dụ: 1240 XP)
  And hiển thị Level hiện tại (ví dụ: Level 3)
  And hiển thị chuỗi ngày hoạt động (ví dụ: 6 Streak Days)
  And hiển thị thanh tiến độ phần trăm hoàn thành curriculum (ví dụ: 46%)
  And hiển thị số bài tập đã được duyệt / tổng số bài tập (ví dụ: 1/3 Approved)

Scenario: Điều hướng nhanh đến bài học đang học dở (Continue Learning)
  Given Learner đang ở màn hình Dashboard
  When Learner click vào nút "Continue Learning" trên thẻ bài học hiện tại
  Then hệ thống sẽ điều hướng trực tiếp Learner đến bài học chưa hoàn thành gần nhất của Track đang học dở (in_progress)
```

---

## 3. Phân hệ Lộ trình & Bài học (Learning Tracks & Lessons)

### US-03: Học lý thuyết theo lộ trình
**As a** Learner  
**I want to** Xem lộ trình timeline và đánh dấu hoàn thành bài học sau khi đọc xong  
**So that** Tôi có thể tích lũy kiến thức và mở khóa các Track tiếp theo.

#### Kịch bản nghiệm thu (Acceptance Criteria - AC):

```gherkin
Scenario: Xem danh sách các bài học thuộc Track đang hoạt động
  Given Learner đang ở màn hình Learning Tracks (Tracks.jsx)
  And Track "NestJS Service Layer" đang có trạng thái "in_progress"
  When Learner click chọn vào Track này
  Then hệ thống hiển thị danh sách các bài học (Lessons) thuộc track đó
  And hiển thị icon tích xanh cạnh các bài học đã hoàn thành
  And hiển thị nút "Đang học" cạnh bài học hiện tại

Scenario: Đánh dấu hoàn thành bài học (Complete Lesson)
  Given Learner đang mở chi tiết một bài học chưa hoàn thành
  When Learner đọc xong nội dung bài viết và click nút "Mark as Completed"
  Then hệ thống gửi request lên API POST /lessons/:id/complete
  And cập nhật trạng thái bài học thành đã hoàn thành (tích xanh)
  And cộng điểm thưởng XP cho Learner (ví dụ: +40 XP)
  And tăng biến đếm `lessonsCompleted` của Track đó lên 1 đơn vị

Scenario: Tự động mở khóa Track tiếp theo sau khi hoàn thành Track hiện tại
  Given Learner vừa click "Mark as Completed" bài học cuối cùng của Track "NestJS Service Layer" (t3)
  When hệ thống gửi request lên API và nhận về phản hồi chứa `unlockedTrackId: "t4"`
  Then hệ thống tự động đổi trạng thái Track "NestJS Service Layer" sang "completed"
  And chuyển trạng thái Track tiếp theo "System Architecture" (t4) từ "locked" sang "in_progress"
  And hiển thị hiệu ứng chúc mừng mở khóa Track mới trên giao diện
```

---

## 4. Phân hệ Thư viện tài liệu (Documentation)

### US-04: Tìm kiếm tài liệu kỹ thuật
**As a** Learner hoặc Admin  
**I want to** Tìm kiếm, lọc tài liệu theo thẻ Tag hoặc Bookmark tài liệu quan trọng  
**So that** Tôi nhanh chóng tra cứu tài liệu phục vụ cho công việc và bài tập.

#### Kịch bản nghiệm thu (Acceptance Criteria - AC):

```gherkin
Scenario: Tìm kiếm và lọc tài liệu theo thẻ tag
  Given Người dùng đang ở màn hình Tài liệu (Docs.jsx)
  When Người dùng nhập từ khóa "auth" vào ô tìm kiếm
  And chọn thẻ tag "NestJS" trên bộ lọc
  Then hệ thống gửi request API GET /documents?q=auth&tags=NestJS
  And cập nhật danh sách hiển thị các tài liệu thỏa mãn cả hai điều kiện
  And không hiển thị các tài liệu không có tag "NestJS" hoặc không chứa từ khóa "auth"

Scenario: Đánh dấu Bookmark tài liệu để đọc sau
  Given Learner đang xem danh sách tài liệu
  When Learner click vào icon bookmark (ngôi sao) trên thẻ tài liệu "Service Auth & JWT Flow"
  Then hệ thống gửi request API POST /documents/:id/bookmark
  And đổi trạng thái hiển thị ngôi sao thành màu vàng
  And thẻ tài liệu đó xuất hiện trong mục "Saved Docs" ở Dashboard của Learner
```

---

## 5. Phân hệ Bài tập & Nộp bài (Exercises & Submissions)

### US-05: Nộp bài tập thực hành tích hợp GitHub PR
**As a** Learner  
**I want to** Nộp đường dẫn GitHub PR cho bài tập và cập nhật lại bài nộp nếu cần  
**So that** Admin có thể chấm điểm và đánh giá code thực tế của tôi.

#### Kịch bản nghiệm thu (Acceptance Criteria - AC):

```gherkin
Scenario: Nộp bài tập lần đầu thành công
  Given Learner đang ở trang chi tiết Bài tập (e2 - "Add a Paginated Users Endpoint")
  And trạng thái bài tập hiện tại là "pending"
  When Learner nhập link PR "github.com/acme/api/pull/119" vào ô nhập liệu
  And click nút "Submit Project"
  Then hệ thống gọi API POST /exercises/e2/submissions
  And đổi trạng thái bài tập trên giao diện thành "submitted" (chờ duyệt)
  And khóa ô nhập liệu (Read-only)

Scenario: Sửa đổi và cập nhật bài nộp cũ (Resubmit)
  Given Learner đang ở trang chi tiết Bài tập (e2)
  And trạng thái bài tập đang là "changes" (Admin yêu cầu chỉnh sửa)
  When Learner nhập link PR mới "github.com/acme/api/pull/125" vào ô nhập liệu
  And click nút "Resubmit Project"
  Then hệ thống gọi API PUT /exercises/e2/submissions
  And cập nhật trạng thái bài nộp về "submitted" (chờ duyệt lại)
  And cập nhật trường `submittedAt` thành thời gian hiện tại
```

---

## 6. Phân hệ Quản trị & Duyệt bài (Admin Review Queue)

### US-06: Chấm điểm bài tập của học viên
**As a** Admin  
**I want to** Xem hàng đợi các bài nộp chưa chấm, phê duyệt hoặc yêu cầu sửa đổi kèm nhận xét  
**So that** Tôi kiểm soát được chất lượng code của học viên và quyết định việc họ qua môn.

#### Kịch bản nghiệm thu (Acceptance Criteria - AC):

```gherkin
Scenario: Phê duyệt bài tập (Approve) thành công
  Given Admin đang ở màn hình Dashboard Admin hoặc hàng đợi Review Queue
  And có một bài nộp của học viên "Mina" đang ở trạng thái "submitted"
  When Admin click vào bài nộp và chọn nút "Approve"
  And nhập nhận xét tùy chọn "Clean keyset impl, nice tests."
  And click nút xác nhận "Duyệt bài"
  Then hệ thống gửi yêu cầu lên API POST /submissions/:id/approve
  And bài nộp biến mất khỏi hàng chờ Review Queue
  And học viên "Mina" nhận được thông báo bài nộp được duyệt thành công
  And học viên "Mina" được cộng +200 XP vào tài khoản

Scenario: Yêu cầu sửa đổi bài tập (Request Changes)
  Given Admin đang xem chi tiết bài nộp của học viên "Raj"
  When Admin click chọn nút "Request Changes"
  And nhập lý do bắt buộc vào ô nhận xét: "Status-dot color should reuse getStatusColor()"
  And click xác nhận "Yêu cầu sửa đổi"
  Then hệ thống gửi yêu cầu lên API POST /submissions/:id/request-changes
  And trạng thái bài tập của học viên "Raj" cập nhật thành "changes"
  And học viên "Raj" nhận được thông báo yêu cầu sửa bài kèm nội dung nhận xét của Admin
```

---

## 7. Phân hệ Quản trị timeline & Nội dung (Curriculum Management)

### US-07: Quản lý và sắp xếp lộ trình học tập
**As a** Admin  
**I want to** Thêm milestone mới hoặc kéo thả thay đổi vị trí các Track  
**So that** Tôi cập nhật chương trình onboarding phù hợp với thay đổi công nghệ của công ty.

#### Kịch bản nghiệm thu (Acceptance Criteria - AC):

```gherkin
Scenario: Tạo mới một Track (Milestone)
  Given Admin đang ở giao diện Learning Tracks (chế độ Admin)
  When Admin click nút "Add Milestone" tại một vị trí trong timeline
  And nhập đầy đủ thông tin: Tiêu đề, Mô tả, Thời gian ước tính, Icon đại diện
  And click nút "Save"
  Then hệ thống gửi API POST /tracks để tạo mới bản ghi trong DB
  And hiển thị Track mới tại vị trí đã chọn trên giao diện
  And tự động tính toán lại thứ tự `order` của các Track phía sau

Scenario: Kéo thả thay đổi thứ tự các Track (Reorder timeline)
  Given Admin đang ở giao diện Learning Tracks
  When Admin nhấn giữ icon kéo (grip-drag) trên thẻ Track "NestJS Service Layer"
  And kéo thả Track này xuống dưới Track "System Architecture"
  Then hệ thống lưu trạng thái thứ tự mới
  And gọi API PATCH /tracks/reorder gửi mảng thứ tự ID mới `["t1", "t2", "t4", "t3", "t5"]`
  And phản hồi thông báo "Tracks reordered thành công"
  And giao diện được hiển thị theo thứ tự kéo thả mới
```

---

## 8. Phân hệ Bảng xếp hạng (Leaderboard)

### US-08: Xem bảng xếp hạng thi đua học tập
**As a** Người dùng hệ thống (Learner hoặc Admin)  
**I want to** Xem bảng xếp hạng xếp hạng học viên theo Level/XP và Streak  
**So that** Tôi so sánh được tiến độ học tập và tạo động lực thi đua trong cohort hoặc toàn công ty.

#### Kịch bản nghiệm thu (Acceptance Criteria - AC):

```gherkin
Scenario: Xem bảng xếp hạng trong Cohort của tôi
  Given Learner "Mina" đã đăng nhập và đang ở trang Dashboard
  When Learner click chọn tab "Leaderboard" và lọc theo "My Cohort"
  Then hệ thống gọi API GET /leaderboard?cohortId=c_spring2026
  And hiển thị danh sách học viên trong cohort Spring 2026 xếp hạng theo thứ tự Level giảm dần -> XP giảm dần -> Streak giảm dần
  And highlight dòng thông tin của Learner "Mina" để dễ nhận diện vị trí của bản thân

Scenario: Lọc xem bảng xếp hạng toàn công ty (Global Leaderboard)
  Given Learner hoặc Admin đang ở trang Leaderboard
  When người dùng chọn bộ lọc phạm vi là "Global"
  Then hệ thống gọi API GET /leaderboard?scope=global
  And hiển thị danh sách tất cả học viên thuộc mọi Cohort trong hệ thống
  And hiển thị cột thông tin tên Cohort tương ứng của mỗi học viên
```

---

## 9. Phân hệ Thông báo & Tích hợp (Slack & Email Notifications)

### US-09: Nhận thông báo tự động qua Slack / Email khi có cập nhật
**As a** Người dùng hệ thống (Learner hoặc Admin)  
**I want to** Nhận tin nhắn thông báo tự động tức thời trên Slack hoặc hòm thư Email khi trạng thái học tập/bài nộp thay đổi  
**So that** Tôi không bỏ lỡ các cập nhật quan trọng và xử lý kịp thời các yêu cầu.

#### Kịch bản nghiệm thu (Acceptance Criteria - AC):

```gherkin
Scenario: Gửi thông báo Slack đến Admin khi có học viên nộp bài tập mới
  Given Learner vừa nộp thành công bài tập "e2" qua link PR
  When hệ thống cập nhật trạng thái bài tập thành "submitted"
  Then hệ thống kích hoạt gửi thông báo tự động (webhook) đến channel Slack của Admin
  And hiển thị nội dung: "[RAMP UP] Học viên Mina Okonkwo vừa nộp bài tập 'Add a Paginated Users Endpoint' (Link: PR #119). Vui lòng kiểm duyệt!"

Scenario: Learner nhận thông báo trực tiếp qua Slack DM và Email khi bài nộp được duyệt (Approved)
  Given Admin vừa nhấn duyệt (Approve) bài tập của Learner "Mina"
  When hệ thống ghi nhận trạng thái bài nộp là "approved"
  Then hệ thống gửi một tin nhắn Direct Message (DM) qua Slack của "Mina"
  And đồng thời gửi một email thông báo đến địa chỉ "mina@acme.dev"
  And nội dung chứa thông tin: "Chúc mừng! Bài tập 'Add a Paginated Users Endpoint' của bạn đã được phê duyệt. Bạn được cộng +200 XP."
```

---

## 10. Phân hệ Lịch sử nộp bài (Submission History)

### US-10: Xem lịch sử và nhật ký sửa đổi bài tập
**As a** Learner hoặc Admin  
**I want to** Xem lại danh sách các phiên bản PR đã nộp trước đây và nhận xét review tương ứng  
**So that** Tôi theo dõi được tiến trình cải thiện chất lượng code và các phản hồi cũ của người chấm.

#### Kịch bản nghiệm thu (Acceptance Criteria - AC):

```gherkin
Scenario: Xem nhật ký lịch sử sửa bài của học viên
  Given Learner hoặc Admin đang xem chi tiết bài tập "e2" đã nộp qua nhiều vòng sửa đổi
  When hệ thống gọi API GET /submissions/s1/history
  Then hệ thống hiển thị danh sách lịch sử nộp bài theo dòng thời gian giảm dần
  And mỗi bản ghi lịch sử hiển thị rõ: Đường link PR nộp lần đó, trạng thái (changes/submitted), ngày nộp, tên Admin review, và ghi chú reviewNote chi tiết của lần chấm đó
```

---

## 11. Phân hệ Quản lý Cohort (Cohort Management)

### US-11: Khởi tạo và thiết lập thông số khóa học viên
**As a** Admin  
**I want to** Khởi tạo Cohort mới, tùy chỉnh số ngày mục tiêu hoàn thành (Target Ramp-up Days)  
**So that** Tôi thiết lập được mốc đo lường và theo dõi thời gian đào tạo cho từng khóa học viên mới.

#### Kịch bản nghiệm thu (Acceptance Criteria - AC):

```gherkin
Scenario: Khởi tạo một Cohort mới thành công
  Given Admin đang ở màn hình Quản lý khóa học (Admin Cohort Control)
  When Admin click nút "Tạo khóa học"
  And nhập tên Cohort "Summer 2026" và thiết lập "Target Ramp-up Days" là 14 ngày
  And click "Lưu cấu hình"
  Then hệ thống gọi API POST /cohorts để tạo mới bản ghi
  And hiển thị Cohort mới "Summer 2026" trong danh sách quản lý
  And thiết lập chỉ số Target Ramp-up Days mặc định cho các phân tích hiệu suất của khóa học này là 14 ngày
```
