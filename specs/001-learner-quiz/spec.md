# Feature Specification: Learner làm Quiz

**Feature Branch**: `001-learner-quiz`

**Created**: 2026-07-17

**Status**: Draft

**Role Scope**: learner

**Input**: User description: Learner muốn mở Quiz, trả lời các câu hỏi và xem kết quả.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hoàn thành Quiz (Priority: P1)

Là learner, tôi muốn mở một Quiz, trả lời các câu hỏi và submit để biết kết quả
học tập của mình.

**Why this priority**: Đây là luồng cốt lõi giúp learner hoàn thành bài tập và
biết mình đã đạt yêu cầu hay chưa.

**Independent Test**: Có thể kiểm thử độc lập bằng cách mở một Quiz từ My Exercises,
chọn đáp án cho các câu hỏi, submit và kiểm tra kết quả hiển thị.

**Acceptance Scenarios**:

1. **Given** learner đang ở My Exercises và có Quiz khả dụng, **When** learner chọn
   Quiz, **Then** hệ thống hiển thị đúng title, mô tả, câu hỏi và các lựa chọn.
2. **Given** learner đang làm Quiz, **When** learner xem hoặc chọn đáp án trước khi
   submit, **Then** hệ thống không hiển thị correct answer.
3. **Given** learner đã chọn đáp án hợp lệ cho Quiz, **When** learner submit thành
   công, **Then** hệ thống hiển thị score và trạng thái passed hoặc không passed.
4. **Given** xảy ra lỗi khi tải Quiz hoặc submit, **When** hệ thống nhận lỗi,
   **Then** hệ thống hiển thị error state và cho phép learner retry.
5. **Given** learner submit Quiz, **When** hệ thống gửi câu trả lời,
   **Then** payload chỉ chứa câu trả lời do learner chọn và kết quả trả về hiển thị
   score, passed, correctCount và kết quả theo từng câu hỏi.

### Edge Cases

- Khi Quiz không có câu hỏi hoặc không còn khả dụng, learner thấy empty/not-found
  state phù hợp và không thể submit một bài Quiz rỗng.
- Khi learner chưa chọn đủ đáp án, nút submit bị disabled hoặc hệ thống yêu cầu
  hoàn tất các câu hỏi còn thiếu.
- Trong lúc Quiz đang tải, hệ thống hiển thị loading state.
- Trong lúc submit, hệ thống hiển thị disabled/submitting state để tránh submit lặp.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST cho phép learner mở Quiz từ My Exercises.
- **FR-002**: Hệ thống MUST hiển thị title, mô tả, câu hỏi và các lựa chọn của Quiz.
- **FR-003**: Hệ thống MUST cho phép learner chọn đáp án cho từng câu hỏi.
- **FR-004**: Hệ thống MUST không gửi hoặc hiển thị `correctAnswer` cho learner
  trước khi submit; dữ liệu learner-facing MUST loại bỏ field này.
- **FR-005**: Hệ thống MUST cho phép learner submit Quiz khi đáp ứng điều kiện hoàn tất.
- **FR-006**: Sau khi submit thành công, hệ thống MUST hiển thị score và trạng thái
  passed hoặc không passed.
- **FR-007**: Khi tải hoặc submit Quiz thất bại, hệ thống MUST hiển thị error state
  và hành động retry.
- **FR-008**: Feature MUST chỉ áp dụng cho role learner; không mở rộng sang mentor,
  admin hoặc guest.
- **FR-009**: Payload submit MUST chỉ chứa `questionId` và câu trả lời do learner
  chọn, không chứa correct answer hoặc dữ liệu chấm đáp án.
- **FR-010**: Kết quả auto-grade MUST hiển thị `score`, `passed`, `correctCount`,
  và kết quả theo từng câu hỏi sau khi submit thành công.
- **FR-011**: Backend MUST không trả `correctAnswer` trong exercise detail response
  dành cho learner; frontend stripping là lớp phòng thủ bổ sung.

### Key Entities

- **Quiz**: Bài tập gồm title, mô tả và một hoặc nhiều câu hỏi.
- **Question**: Câu hỏi thuộc Quiz, gồm nội dung và các lựa chọn trả lời.
- **Quiz Result**: Kết quả sau khi submit, gồm score và trạng thái passed hoặc không
  passed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% Quiz khả dụng hiển thị đúng title, mô tả, câu hỏi và lựa chọn
  theo dữ liệu được cung cấp.
- **SC-002**: 100% lần submit thành công hiển thị score và trạng thái passed hoặc
  không passed.
- **SC-003**: 100% lỗi tải hoặc submit có error state và hành động retry.
- **SC-004**: Learner có thể hoàn thành luồng mở Quiz → chọn đáp án → submit → xem
  kết quả mà không cần rời khỏi luồng Quiz.

## Assumptions

- Learner đã đăng nhập và có quyền truy cập Quiz trong My Exercises.
- Điều kiện passed và cách tính score đã được xác định ở nguồn dữ liệu của Quiz;
  spec này chỉ yêu cầu hiển thị kết quả.
- Quiz v1 không bao gồm giải thích đáp án, làm lại Quiz hoặc lịch sử nhiều lần làm.
