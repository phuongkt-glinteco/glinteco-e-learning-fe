# Tài liệu Đặc tả Use Case, Scenario, Test Case & Unit Test

Tài liệu này trình bày quy trình từ khâu thiết kế **Use Case**, mô tả **Scenario (BDD)**, đặc tả **Test Case**, cho đến viết mã nguồn **Unit Test** trong hệ thống **RAMP UP** (Glinteco e-Learning BE). 

Chúng ta sẽ lấy phân hệ **Quản lý Bài nộp của Học viên (Submissions Module)** làm ví dụ cốt lõi.

---

## 1. Use Case (Lược đồ Sử dụng)

### Use Case 1: Nộp bài tập lần đầu (Learner)
* **Tên Use Case**: Nộp bài tập (Submit Exercise)
* **Tác nhân (Actor)**: Học viên (Learner)
* **Mô tả**: Học viên thực hiện gửi đường dẫn Pull Request (PR URL) GitHub chứa mã nguồn bài giải cho một bài tập trong hệ thống.
* **Tiền điều kiện (Preconditions)**:
  1. Học viên đã đăng nhập và được xác thực qua JWT.
  2. Bài tập (Exercise) tồn tại trong hệ thống và thuộc về Track mà học viên đang tham gia.
* **Luồng xử lý chính (Basic Flow)**:
  1. Học viên truy cập vào bài tập, nhập PR URL của GitHub và bấm gửi.
  2. Hệ thống kiểm tra tính hợp lệ của PR URL (phải là URL GitHub hợp lệ).
  3. Hệ thống kiểm tra xem học viên đã từng nộp bài tập này chưa.
  4. Hệ thống lưu bài nộp với trạng thái ban đầu là `SUBMITTED` (Đã nộp).
  5. Hệ thống ghi lại lịch sử bài nộp (Submission History) và trả về thông tin bài nộp thành công.
* **Luồng rẽ nhánh / Ngoại lệ (Alternative / Exception Flows)**:
  * *Ngoại lệ 1 (PR URL không đúng định dạng)*: Hệ thống báo lỗi Validation và không tạo bài nộp.
  * *Ngoại lệ 2 (Bài tập đã nộp trước đó)*: Hệ thống hướng dẫn học viên sử dụng chức năng nộp lại (Resubmit).

---

### Use Case 2: Đánh giá bài tập (Admin)
* **Tên Use Case**: Đánh giá bài nộp (Review Submission)
* **Tác nhân (Actor)**: Quản trị viên (Admin) / Người chấm điểm
* **Mô tả**: Admin xem chi tiết bài nộp và đưa ra quyết định Duyệt (`APPROVED`) hoặc Yêu cầu sửa đổi (`CHANGES_REQUESTED`) kèm theo nhận xét.
* **Tiền điều kiện**:
  1. Admin đã đăng nhập thành công.
  2. Bài nộp tồn tại và ở trạng thái chờ chấm điểm (`SUBMITTED`).
* **Luồng xử lý chính (Basic Flow)**:
  1. Admin xem danh sách bài nộp chờ chấm.
  2. Admin bấm chọn xem chi tiết bài nộp của học viên.
  3. Admin đưa ra nhận xét (comment) và chọn trạng thái chấm (Duyệt/Yêu cầu sửa đổi).
  4. Hệ thống cập nhật trạng thái bài nộp.
  5. Hệ thống lưu lại lịch sử chấm điểm (ai chấm, khi nào, nhận xét gì).
* **Luồng rẽ nhánh / Ngoại lệ**:
  * *Ngoại lệ 1 (Người dùng không phải Admin)*: Hệ thống chặn quyền bằng `RolesGuard` và trả về lỗi `403 Forbidden`.

---

## 2. Scenario (Kịch bản BDD)

Sử dụng ngôn ngữ Gherkin (`Given - When - Then`) để đặc tả kịch bản hành vi.

### Kịch bản 1: Học viên nộp bài tập thành công
```gherkin
Given Học viên có tài khoản hợp lệ và đã đăng nhập
  And Bài tập có ID "ex-101" tồn tại trong hệ thống
When Học viên gửi yêu cầu nộp bài tập "ex-101" với PR URL "https://github.com/user/repo/pull/1"
Then Hệ thống tạo mới một bản ghi bài nộp (Submission)
  And Trạng thái của bài nộp là "SUBMITTED"
  And Trả về mã phản hồi thành công "201 Created"
```

### Kịch bản 2: Học viên gửi PR URL không hợp lệ
```gherkin
Given Học viên đã đăng nhập hệ thống
When Học viên nộp bài tập với PR URL "link-invalid-github"
Then Hệ thống chặn yêu cầu ngay lập tức
  And Trả về lỗi Validation "400 Bad Request"
  And Không tạo mới bất kỳ bản ghi bài nộp nào
```

### Kịch bản 3: Admin phê duyệt bài tập của học viên
```gherkin
Given Admin đã đăng nhập hệ thống
  And Bài nộp có ID "sub-202" đang ở trạng thái "SUBMITTED"
When Admin gửi yêu cầu phê duyệt bài nộp "sub-202" với nhận xét "Mã nguồn sạch, thuật toán tối ưu!"
Then Trạng thái bài nộp "sub-202" chuyển thành "APPROVED"
  And Lịch sử chấm bài được ghi nhận
  And Trả về kết quả thành công "200 OK"
```

---

## 3. Test Case (Bảng ca kiểm thử)

| ID | Tên Test Case | Mô tả / Các bước thực hiện | Dữ liệu đầu vào (Input) | Kết quả mong đợi (Expected Output) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC_SUB_01** | Nộp bài thành công | 1. Gửi request POST `exercises/ex-1/submissions`<br>2. Kiểm tra DB | Header: JWT (Learner)<br>Body: `{ "prUrl": "https://github.com/org/repo/pull/5" }` | Response `201 Created` chứa ID bài nộp, trạng thái là `SUBMITTED`. | Pass |
| **TC_SUB_02** | Validation PR URL thất bại | Gửi request POST với URL không phải GitHub | Header: JWT (Learner)<br>Body: `{ "prUrl": "google.com" }` | Response `400 Bad Request` cùng với thông báo lỗi định dạng URL. | Pass |
| **TC_SUB_03** | Lấy danh sách bài nộp cá nhân | Gửi request GET `submissions/mine` | Header: JWT (Learner) | Trả về mảng bài nộp chỉ của học viên đó. | Pass |
| **TC_SUB_04** | Admin duyệt bài nộp | Gửi request POST `submissions/sub-1/approve` | Header: JWT (Admin)<br>Body: `{ "comment": "Good job" }` | Trạng thái bài nộp cập nhật sang `APPROVED`, trả về `200 OK`. | Pass |
| **TC_SUB_05** | Người dùng thường không được duyệt bài | Gửi request duyệt bài bằng tài khoản Learner | Header: JWT (Learner) | Trả về `403 Forbidden`. | Pass |

---

## 4. Test (Mã nguồn kiểm thử tự động)

Dưới đây là cách triển khai ca kiểm thử bằng Jest trong NestJS cho **SubmissionsController** và **SubmissionsService**.

### 4.1. Unit Test cho Controller (`submissions.controller.spec.ts`)
Chúng ta sử dụng mock service để kiểm tra xem Controller có chuyển tiếp đúng tham số từ Request và DTO xuống cho Service xử lý hay không.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { SubmissionStatus } from '../database/entities/submission.entity';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;

  // Tạo mock service
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
      // Override guards để bỏ qua logic phân quyền khi unit test controller
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
  });

  // TC_SUB_01: Nộp bài thành công (kiểm tra phía controller)
  it('should delegate submit to service with userId and prUrl', async () => {
    const mockRequest = { user: { id: 'learner-123', role: 'learner' } };
    const dto = { prUrl: 'https://github.com/user/repo/pull/1' };
    mockSubmissionsService.submit.mockResolvedValue({ id: 'sub-999', status: SubmissionStatus.SUBMITTED });

    const result = await controller.submit('ex-1', dto, mockRequest);

    expect(mockSubmissionsService.submit).toHaveBeenCalledWith(
      'ex-1',
      'learner-123',
      dto.prUrl
    );
    expect(result).toEqual({ id: 'sub-999', status: SubmissionStatus.SUBMITTED });
  });

  // TC_SUB_04: Admin duyệt bài nộp
  it('should delegate approve to review service with APPROVED status', async () => {
    const mockRequest = { user: { id: 'admin-456', role: 'admin' } };
    const body = { comment: 'Làm rất tốt!' };
    mockSubmissionsService.review.mockResolvedValue({ id: 'sub-999', status: SubmissionStatus.APPROVED });

    const result = await controller.approve('sub-999', body, mockRequest);

    expect(mockSubmissionsService.review).toHaveBeenCalledWith(
      'sub-999',
      'admin-456',
      SubmissionStatus.APPROVED,
      body.comment
    );
    expect(result).toEqual({ id: 'sub-999', status: SubmissionStatus.APPROVED });
  });
});
```

### 4.2. Integration/Unit Test cho Service (`submissions.service.spec.ts`)
Phần này kiểm tra logic nghiệp vụ thực tế như: lưu trữ vào cơ sở dữ liệu, bắn lỗi khi không tìm thấy bài tập, hay cập nhật lịch sử.

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

  // Mock các repository
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
    it('should throw NotFoundException if exercise does not exist', async () => {
      mockExerciseRepo.findOne.mockResolvedValue(null); // Không tìm thấy exercise

      await expect(
        service.submit('invalid-exercise', 'user-1', 'https://github.com/pr/1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should create and save submission and history', async () => {
      const mockExercise = { id: 'ex-1', title: 'Bài tập 1' };
      mockExerciseRepo.findOne.mockResolvedValue(mockExercise);
      
      const savedSubmission = {
        id: 'sub-1',
        exerciseId: 'ex-1',
        userId: 'user-1',
        prUrl: 'https://github.com/pr/1',
        status: SubmissionStatus.SUBMITTED,
      };
      mockSubmissionRepo.create.mockReturnValue(savedSubmission);
      mockSubmissionRepo.save.mockResolvedValue(savedSubmission);

      const result = await service.submit('ex-1', 'user-1', 'https://github.com/pr/1');

      expect(mockSubmissionRepo.save).toHaveBeenCalled();
      expect(mockHistoryRepo.save).toHaveBeenCalled();
      expect(result).toEqual(savedSubmission);
    });
  });
});
```

---

## 5. Kết luận
* **Use Case** định nghĩa **cái gì** (What) khách hàng/người dùng muốn làm.
* **Scenario** cụ thể hóa **luồng kịch bản cụ thể** (How it behaves) bằng ngôn ngữ tự nhiên, giúp BA, QA và Developer thống nhất hiểu biết.
* **Test Case** vạch ra **bước kiểm thử chi tiết** kèm dữ liệu đầu vào & kết quả mong đợi.
* **Unit/Integration Test** tự động hóa các kịch bản kiểm thử trên để đảm bảo mã nguồn chạy ổn định, không bị lỗi khi sửa đổi (regression).
