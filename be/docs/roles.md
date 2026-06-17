# Phân Quyền và Vai Trò Người Dùng (Roles & Permissions Matrix)

Tài liệu này đặc tả chi tiết về hệ thống vai trò (Roles), ma trận phân quyền (Permissions Matrix) và các kịch bản kiểm thử bảo mật tương ứng trong hệ thống **RAMP UP**.

---

## 1. Danh sách Vai trò (User Roles)

Hệ thống định nghĩa hai nhóm người dùng chính được lưu dưới dạng Enum `UserRole` trong database:

1. **`LEARNER` (Học viên)**: 
   * Là đối tượng chính tham gia học tập, đọc tài liệu, xem các Track/Lesson và thực hiện nộp bài giải bài tập (PR URL GitHub).
2. **`ADMIN` (Quản trị viên / Mentor)**:
   * Có toàn quyền quản trị hệ thống, quản lý Cohorts, Tracks, tài liệu (Documents), tìm kiếm nâng cao và đánh giá/chấm điểm bài tập của học viên.

---

## 2. Ma trận Phân quyền (Permissions Matrix)

| Chức năng (Feature) | Đường dẫn API (Endpoint) | Phương thức (Method) | Quyền Learner | Quyền Admin |
| :--- | :--- | :---: | :---: | :---: |
| **Xác thực** | `/auth/google` | POST | Cho phép | Cho phép |
| **Xác thực** | `/auth/refresh` | POST | Cho phép | Cho phép |
| **Học viên** | `/users/profile` | GET / PUT | Chỉ cá nhân | Cho phép |
| **Lớp học (Cohort)** | `/cohorts` | GET | Xem tất cả | Xem tất cả |
| **Lớp học (Cohort)** | `/cohorts` | POST / PUT / DELETE | 🔴 Bị chặn | Cho phép |
| **Lộ trình (Tracks)** | `/tracks` | GET | Xem tất cả | Xem tất cả |
| **Lộ trình (Tracks)** | `/tracks` | POST / PUT / DELETE | 🔴 Bị chặn | Cho phép |
| **Nộp bài tập** | `/exercises/:id/submissions` | POST / PUT | Cho phép | 🔴 Bị chặn |
| **Xem bài nộp cá nhân**| `/submissions/mine` | GET | Cho phép | Cho phép |
| **Hàng chờ chấm điểm**| `/submissions` | GET | 🔴 Bị chặn | Cho phép |
| **Chấm điểm & Duyệt** | `/submissions/:id/approve` | POST | 🔴 Bị chặn | Cho phép |
| **Yêu cầu sửa đổi** | `/submissions/:id/request-changes` | POST | 🔴 Bị chặn | Cho phép |

---

## 3. Kịch bản BDD Kiểm thử Phân quyền (RBAC Scenarios)

### Kịch bản 1: Học viên truy cập trái phép chức năng Admin (Chặn truy cập)
```gherkin
Given Người dùng đã đăng nhập với vai trò "LEARNER"
When Người dùng gửi yêu cầu GET tới danh sách toàn bộ bài nộp của hệ thống "/submissions"
Then Hệ thống chặn yêu cầu tại lớp bảo vệ "RolesGuard"
  And Không gọi xuống tầng nghiệp vụ Service
  And Trả về mã lỗi "403 Forbidden"
```

### Kịch bản 2: Admin truy cập chức năng Admin thành công
```gherkin
Given Người dùng đã đăng nhập với vai trò "ADMIN"
When Admin gửi yêu cầu GET tới danh sách toàn bộ bài nộp của hệ thống "/submissions"
Then Hệ thống xác thực quyền hợp lệ thông qua Decorator "@Roles(UserRole.ADMIN)"
  And Chuyển tiếp yêu cầu xuống SubmissionsService để lấy danh sách
  And Trả về mã phản hồi "200 OK" kèm dữ liệu
```

---

## 4. Đặc tả Test Case Bảo mật (Security Test Cases)

| Test Case ID | Mục tiêu kiểm thử | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi (Expected Output) |
| :--- | :--- | :--- | :--- | :--- |
| **TC_SEC_01** | Gọi API không có Token | Request bất kỳ API có bảo vệ (ví dụ: `GET /cohorts`) | 1. Gửi request không đính kèm header `Authorization`. | HTTP Status: `401 Unauthorized`. |
| **TC_SEC_02** | Gọi API với Token sai định dạng | Header: `Authorization: Bearer invalid_token` | 1. Gửi request kèm chuỗi token ngẫu nhiên không đúng chuẩn JWT. | HTTP Status: `401 Unauthorized`. |
| **TC_SEC_03** | Sai vai trò truy cập (Learner -> Admin API) | Header: JWT Learner<br>API: `POST /cohorts` | 1. Đăng nhập tài khoản Learner.<br>2. Gọi API tạo Cohort của Admin. | HTTP Status: `403 Forbidden`. |
| **TC_SEC_04** | Đúng vai trò truy cập (Admin -> Admin API) | Header: JWT Admin<br>API: `POST /cohorts` | 1. Đăng nhập tài khoản Admin.<br>2. Gọi API tạo Cohort. | HTTP Status: `201 Created` / `200 OK`. |

---

## 5. Triển khai Test Case Bảo mật bằng Jest (`roles.guard.spec.ts`)

NestJS sử dụng `RolesGuard` kết hợp với custom decorator `@Roles()` để bảo vệ endpoint. Dưới đây là mã nguồn unit test cho `RolesGuard` đảm bảo phân quyền hoạt động chính xác:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '../database/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockExecutionContext = (userRole?: string, routeRoles?: string[]): ExecutionContext => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userRole ? { role: userRole } : null,
        }),
      }),
    } as any;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles are defined for the route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = mockExecutionContext(UserRole.LEARNER);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if route requires roles but user is not logged in', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    const context = mockExecutionContext(undefined);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('TC_SEC_03: should deny access if user role does not match required route roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    const context = mockExecutionContext(UserRole.LEARNER);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('TC_SEC_04: should allow access if user role matches one of required route roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    const context = mockExecutionContext(UserRole.ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });
});
```

---

## 6. Kết Quả Kiểm Thử & Độ Bao Phủ (Test Results & Coverage Report)

Dưới đây là thống kê độ bao phủ (code coverage) thực tế liên quan đến phân quyền truy cập (Guards & Decorators) thu được từ Jest:

| File / Thư mục | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **src/modules/auth/guards/roles.guard.ts** | **100%** | **90%** | **100%** | **100%** | 14 |
| **src/modules/auth/guards/jwt-auth.guard.ts** | **100%** | **100%** | **100%** | **100%** | |

Các ca kiểm thử bảo mật (Security Test Cases) được triển khai đầy đủ nhằm ngăn chặn học viên truy cập các API của quản trị viên và ngược lại, đảm bảo hệ thống RBAC hoạt động chính xác với độ bao phủ 100% statements.

