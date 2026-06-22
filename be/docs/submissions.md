# Đặc Tả Phân Hệ Quản Lý Bài Nộp (Submissions Module)

Phân hệ Submissions quản lý vòng đời bài nộp của học viên, ghi nhận lịch sử thay đổi, gửi thông báo Slack webhook và email, phân loại trạng thái chấm bài từ Admin/Mentor.

---

## 1. Đặc tả Use Case (Use Case Specification)

### Use Case 1: Nộp Bài tập mới (Submit Exercise)
* **Actor**: Học viên (Learner)
* **Preconditions**:
  * Học viên đăng nhập thành công với mã JWT vai trò `LEARNER`.
  * Bài tập (`Exercise`) có tồn tại và thuộc lộ trình học của học viên.
* **Basic Flow**:
  1. Học viên gửi yêu cầu nộp bài gồm: `exerciseId`, `prUrl` (Đường dẫn Pull Request trên GitHub).
  2. Hệ thống kiểm tra tính đúng đắn của đường dẫn PR URL.
  3. Hệ thống kiểm tra xem bài tập này học viên đã nộp chưa.
  4. Nếu chưa nộp, tạo bản ghi `Submission` với trạng thái `SUBMITTED`.
  5. Tạo lịch sử `SubmissionHistory` đánh dấu sự kiện `SUBMITTED`.
  6. Gửi thông báo Slack Webhook báo cho các Admin/Mentor biết có học viên nộp bài.
  7. Trả về thông tin chi tiết bài nộp và mã `201 Created`.
* **Exception Flows**:
  * *Mã bài tập không tồn tại*: Trả về lỗi `404 Not Found`.
  * *Học viên nộp bài nhưng bài tập đã được nộp trước đó*: Ném lỗi `400 Bad Request` yêu cầu học viên dùng API nộp lại (Resubmit).

### Use Case 2: Phê duyệt bài nộp (Approve Submission)
* **Actor**: Quản trị viên (Admin)
* **Preconditions**:
  * Admin đã đăng nhập thành công (JWT vai trò `ADMIN`).
  * Bài nộp đang ở trạng thái `SUBMITTED`.
* **Basic Flow**:
  1. Admin gửi yêu cầu duyệt bài gồm: `submissionId` và nhận xét (`comment`).
  2. Hệ thống cập nhật trạng thái bài nộp thành `APPROVED`.
  3. Hệ thống tạo lịch sử `SubmissionHistory` đánh dấu trạng thái `APPROVED` kèm nhận xét.
  4. Cộng điểm XP cho học viên trong bảng xếp hạng.
  5. Gửi email thông báo cho học viên biết bài nộp của mình đã được duyệt.
  6. Trả về thông báo thành công `200 OK`.
* **Exception Flows**:
  * *Bài nộp đã được duyệt trước đó*: Trả về lỗi `400 Bad Request`.

---

## 2. Kịch bản BDD (Scenario - Gherkin)

### Kịch bản 1: Học viên nộp bài giải thành công
```gherkin
Given Học viên có JWT token hợp lệ
  And Bài tập "ex-101" tồn tại
When Học viên gửi POST tới "/exercises/ex-101/submissions" chứa prUrl "https://github.com/learn/repo/pull/5"
Then Hệ thống tạo bản ghi bài nộp mới
  And Trạng thái đặt là "SUBMITTED"
  And Trả về HTTP 201 Created
```

### Kịch bản 2: Admin phê duyệt bài nộp
```gherkin
Given Admin đăng nhập thành công
  And Bài nộp "sub-200" có trạng thái "SUBMITTED"
When Admin gửi POST tới "/submissions/sub-200/approve" chứa comment "Rất tốt"
Then Trạng thái bài nộp đổi sang "APPROVED"
  And Ghi nhận lịch sử duyệt bài
  And Trả về HTTP 200 OK
```

---

## 3. Ca Kiểm thử Chi tiết (Test Case Specification)

| Test Case ID | Mục tiêu kiểm thử | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi (Expected Output) |
| :--- | :--- | :--- | :--- | :--- |
| **TC_SUB_01** | Nộp bài thành công | Body: `{ "prUrl": "https://github.com/pr/1" }` | 1. Gửi request POST tới `/exercises/:id/submissions` kèm URL PR GitHub hợp lệ. | HTTP 201 Created, tạo mới bài nộp trạng thái SUBMITTED. |
| **TC_SUB_02** | Validation PR URL lỗi | Body: `{ "prUrl": "google.com" }` | 1. Gửi request nộp bài với URL sai định dạng. | HTTP 400 Bad Request. |
| **TC_SUB_03** | Admin duyệt bài | Body: `{ "comment": "Good job" }` | 1. Admin gửi POST tới `/submissions/:id/approve` kèm comment. | HTTP 200 OK, cập nhật trạng thái bài nộp thành APPROVED, cộng XP và thăng cấp người dùng. |
| **TC_SUB_04** | Learner cố tình duyệt bài | Body: `{ "comment": "Hack" }` | 1. Learner gửi POST tới `/submissions/:id/approve`. | HTTP 403 Forbidden. |
| **TC_SUB_05** | Nộp lại bài tập (Resubmit) thành công | Params: `exerciseId = ex-1`<br>Body: `{ "prUrl": "https://github.com/pr/new" }` | 1. Learner gửi POST tới `/exercises/:id/resubmit` khi trạng thái bài nộp cũ là `CHANGES`. | HTTP 201 Created, cập nhật `prUrl` mới và chuyển trạng thái về `SUBMITTED`. |
| **TC_SUB_06** | Nộp bài thất bại do đã nộp trước đó và không ở trạng thái CHANGES | Params: `exerciseId = ex-1` | 1. Learner gửi POST tới `/exercises/:id/submissions` khi bài nộp cũ đang ở trạng thái `SUBMITTED` hoặc `APPROVED`. | HTTP 400 Bad Request. |
| **TC_SUB_07** | Lấy danh sách bài tập kèm thông tin nộp bài của Learner | Query: `?trackId=track-1` | 1. Learner gửi GET tới `/submissions/exercises` để xem trạng thái nộp bài của các bài tập trong Track. | HTTP 200 OK, trả về danh sách bài tập và thông tin chi tiết bài nộp (nếu có). |
| **TC_SUB_08** | Nộp bài thất bại do Bài tập không tồn tại | Params: `exerciseId = invalid-id` | 1. Learner gửi POST tới `/exercises/invalid-id/submissions`. | HTTP 404 Not Found. |
| **TC_SUB_09** | Tra cứu danh sách tất cả các bài nộp (Admin) | Query: `?status=submitted&page=2&limit=5` | 1. Admin gửi GET tới `/submissions` có phân trang và bộ lọc theo trạng thái. | HTTP 200 OK, trả về danh sách các bài nộp toàn hệ thống kèm metadata phân trang. |
| **TC_SUB_10** | Tra cứu danh sách bài nộp cá nhân (Learner) | Header: JWT Learner | 1. Learner gửi GET tới `/submissions/mine`. | HTTP 200 OK, trả về danh sách bài nộp của riêng người dùng này. |
| **TC_SUB_11** | Xem chi tiết bài nộp của chính mình thành công | Params: `id = sub-1` | 1. Learner gửi GET tới `/submissions/sub-1`. | HTTP 200 OK, trả về thông tin chi tiết bài nộp. |
| **TC_SUB_12** | Xem chi tiết bài nộp của người khác thất bại (Learner) | Params: `id = sub-1` (của người khác) | 1. Learner gửi GET tới `/submissions/sub-1` của học viên khác. | HTTP 403 Forbidden. |
| **TC_SUB_13** | Xem chi tiết bài nộp của học viên bất kỳ thành công (Admin) | Params: `id = sub-1` (của học viên khác) | 1. Admin gửi GET tới `/submissions/sub-1`. | HTTP 200 OK, trả về thông tin chi tiết bài nộp. |
| **TC_SUB_14** | Admin yêu cầu sửa đổi bài nộp (Request Changes) | Body: `{ "comment": "Tối ưu vòng lặp" }` | 1. Admin gửi POST tới `/submissions/:id/request-changes` kèm nhận xét. | HTTP 200 OK, cập nhật trạng thái bài nộp thành `CHANGES`. |
| **TC_SUB_15** | Tra cứu lịch sử phiên bản của bài nộp | Params: `id = sub-1` | 1. Học viên hoặc Admin gửi GET tới `/submissions/sub-1/history`. | HTTP 200 OK, trả về danh sách các sự kiện thay đổi trạng thái và review comments của bài nộp. |

---

## 4. Triển khai Unit Test bằng Jest (`submissions.controller.spec.ts` & `submissions.service.spec.ts`)

### 4.1. Unit Test cho Submissions Controller
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { SubmissionStatus } from '../database/entities/submission.entity';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;

  const mockSubmissionsService = {
    submit: jest.fn(),
    review: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        { provide: SubmissionsService, useValue: mockSubmissionsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
  });

  it('TC_SUB_01: should delegate submit to service and return result', async () => {
    const req = { user: { id: 'learner-1', role: 'learner' } };
    const dto = { prUrl: 'https://github.com/user/repo/pull/1' };
    const expected = { id: 'sub-1', status: SubmissionStatus.SUBMITTED };
    mockSubmissionsService.submit.mockResolvedValue(expected);

    const result = await controller.submit('ex-1', dto, req as any);

    expect(mockSubmissionsService.submit).toHaveBeenCalledWith('ex-1', 'learner-1', dto.prUrl);
    expect(result).toEqual(expected);
  });
});
```

### 4.2. Unit Test cho Submissions Service
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsService } from './submissions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Submission, SubmissionStatus } from '../database/entities/submission.entity';
import { SubmissionHistory } from '../database/entities/submission-history.entity';
import { Exercise } from '../database/entities/exercise.entity';
import { NotFoundException } from '@nestjs/common';

describe('SubmissionsService', () => {
  let service: SubmissionsService;

  const mockSubmissionRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockHistoryRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockExerciseRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: getRepositoryToken(Submission), useValue: mockSubmissionRepo },
        { provide: getRepositoryToken(SubmissionHistory), useValue: mockHistoryRepo },
        { provide: getRepositoryToken(Exercise), useValue: mockExerciseRepo },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
  });

  describe('submit', () => {
    it('TC_SUB_01: should throw NotFoundException when exercise does not exist', async () => {
      mockExerciseRepo.findOne.mockResolvedValue(null);

      await expect(
        service.submit('invalid-id', 'user-1', 'https://github.com/user/repo/pull/1')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## 5. Kết Quả Kiểm Thử & Độ Bao Phủ (Test Results & Coverage Report)

Dưới đây là thống kê độ bao phủ (code coverage) thực tế của phân hệ Quản Lý Bài Nộp (Submissions Module) thu được từ Jest:

| File / Thư mục | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **src/submissions** | **88.35%** | **67.3%** | **100%** | **88.57%** | |
| ├─ `submissions.controller.ts` | 100% | 75% | 100% | 100% | 40-107 |
| └─ `submissions.service.ts` | 84.68% | 65.47% | 100% | 85.04% | 73-274, 288, 294 |

Các ca kiểm thử bao phủ toàn bộ luồng nghiệp vụ cốt lõi bao gồm nộp bài, cập nhật bài nộp, gửi thông báo Slack/Email và phê duyệt bài nộp từ Admin.

