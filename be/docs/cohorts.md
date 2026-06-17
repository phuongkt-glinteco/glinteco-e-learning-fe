# Đặc Tả Phân Hệ Lớp Học (Cohorts Module)

Phân hệ Cohorts quản lý các lớp học (đợt tuyển dụng/đào tạo học viên mới), thiết lập thời gian dự kiến (targetRampDays), phân nhóm người dùng học tập và theo dõi tiến độ.

---

## 1. Đặc tả Use Case (Use Case Specification)

### Use Case 1: Tạo mới Lớp học (Create Cohort - Admin only)
* **Actor**: Quản trị viên (Admin)
* **Preconditions**:
  * Admin đã đăng nhập thành công (JWT vai trò `ADMIN`).
* **Basic Flow**:
  1. Admin gửi yêu cầu tạo lớp học gồm: `name` (Tên lớp, ví dụ: "Onboarding K25") và `targetRampDays` (Số ngày hoàn thành mục tiêu, ví dụ: 30).
  2. Hệ thống kiểm tra trùng lặp tên lớp học trong DB.
  3. Hệ thống tạo mới bản ghi `Cohort` với trạng thái mặc định `isActive = true`.
  4. Trả về thông tin lớp học vừa tạo và mã `201 Created`.
* **Exception Flows**:
  * *Tên lớp học bị trùng*: Ném lỗi `400 Bad Request` cùng thông báo lỗi tương ứng.
  * *Số ngày mục tiêu không hợp lệ (không phải số nguyên dương)*: Ném lỗi `400 Bad Request` từ ValidationPipe.

### Use Case 2: Cập nhật Lớp học (Update Cohort - Admin only)
* **Actor**: Quản trị viên (Admin)
* **Preconditions**:
  * Admin đã đăng nhập thành công (JWT vai trò `ADMIN`).
  * Lớp học cần sửa đổi tồn tại trong cơ sở dữ liệu.
* **Basic Flow**:
  1. Admin gửi yêu cầu sửa thông tin lớp học gồm `cohortId` và các trường dữ liệu cần sửa đổi (`name`, `targetRampDays`, `isActive`).
  2. Hệ thống cập nhật bản ghi trong database.
  3. Trả về thông tin lớp học sau khi sửa và mã `200 OK`.
* **Exception Flows**:
  * *Không tìm thấy lớp học*: Ném lỗi `404 Not Found`.

---

## 2. Kịch bản BDD (Scenario - Gherkin)

### Kịch bản 1: Admin tạo mới một lớp học thành công
```gherkin
Given Admin đăng nhập thành công hệ thống
When Admin gửi POST tới "/cohorts" chứa thông tin:
  | name           | Onboarding K25 |
  | targetRampDays | 30             |
Then Hệ thống tạo mới bản ghi Cohort trong DB
  And Thuộc tính isActive là true
  And Trả về HTTP 201 Created kèm dữ liệu lớp học
```

### Kịch bản 2: Learner cố gắng tạo lớp học (Bị chặn)
```gherkin
Given Học viên đăng nhập thành công với vai trò "LEARNER"
When Học viên gửi yêu cầu POST tới "/cohorts" tạo lớp học "Hack Class"
Then Hệ thống chặn yêu cầu ngay lập tức ở RolesGuard
  And Trả về mã lỗi "403 Forbidden"
  And Không tạo bất kỳ Cohort nào
```

---

## 3. Ca Kiểm thử Chi tiết (Test Case Specification)

| Test Case ID | Mục tiêu kiểm thử | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi (Expected Output) |
| :--- | :--- | :--- | :--- | :--- |
| **TC_COH_01** | Tạo lớp học thành công (Admin) | Body: `{ "name": "K26", "targetRampDays": 45 }` | 1. Admin gửi POST tới `/cohorts`. | HTTP 201 Created, tạo mới lớp học. |
| **TC_COH_02** | Tạo lớp học thiếu tên (Validation) | Body: `{ "targetRampDays": 30 }` | 1. Gửi request tạo lớp học thiếu trường `name`. | HTTP 400 Bad Request. |
| **TC_COH_03** | Learner cố sửa đổi lớp học | Params: `id = uuid-1`<br>Body: `{ "name": "K26 Updated" }` | 1. Learner gửi PUT tới `/cohorts/uuid-1`. | HTTP 403 Forbidden. |
| **TC_COH_04** | Cập nhật lớp học không tồn tại | Params: `id = invalid-uuid`<br>Body: `{ "name": "K26" }` | 1. Admin gửi PUT tới `/cohorts/invalid-uuid`. | HTTP 404 Not Found. |

---

## 4. Triển khai Unit Test bằng Jest (`cohort.controller.spec.ts` & `cohort.service.spec.ts`)

### 4.1. Unit Test cho Cohorts Controller
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CohortController } from './cohort.controller';
import { CohortService } from './cohort.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';

describe('CohortController', () => {
  let controller: CohortController;

  const mockCohortService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CohortController],
      providers: [
        { provide: CohortService, useValue: mockCohortService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CohortController>(CohortController);
  });

  it('TC_COH_01: should call service.create and return cohort', async () => {
    const dto: CreateCohortDto = { name: 'K26', targetRampDays: 45 };
    const expected = { id: 'cohort-1', ...dto, isActive: true };
    mockCohortService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(mockCohortService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });
});
```

### 4.2. Unit Test cho Cohorts Service
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CohortService } from './cohort.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cohort } from '../database/entities/cohort.entity';
import { NotFoundException } from '@nestjs/common';

describe('CohortService', () => {
  let service: CohortService;

  const mockCohortRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CohortService,
        { provide: getRepositoryToken(Cohort), useValue: mockCohortRepo },
      ],
    }).compile();

    service = module.get<CohortService>(CohortService);
  });

  describe('update', () => {
    it('TC_COH_04: should throw NotFoundException when cohort is not found', async () => {
      mockCohortRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('invalid-uuid', { name: 'New Name' })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
```
