# Đặc Tả Phân Hệ Xác Thực & Ủy Quyền (Auth Module)

Phân hệ Xác thực & Ủy quyền phụ trách đăng nhập qua Google OAuth2, cấp phát và quản lý JSON Web Tokens (Access Token và Refresh Token) cùng việc phân quyền truy cập thông qua Guards.

---

## 1. Đặc tả Use Case (Use Case Specification)

### Use Case 1: Đăng nhập bằng Google (Google OAuth2 Login)
* **Actor**: Học viên (Learner) / Quản trị viên (Admin)
* **Preconditions**: Người dùng đã sở hữu một tài khoản Google đang hoạt động.
* **Basic Flow**:
  1. Người dùng gửi `idToken` nhận được từ Google OAuth Client (Web/App) lên API `/auth/google`.
  2. Máy chủ sử dụng thư viện `google-auth-library` để gửi xác thực và giải mã token với Google.
  3. Lấy thông tin hồ sơ của người dùng từ Google: `email`, `name`, `picture`.
  4. Hệ thống kiểm tra trong database:
     * Nếu Email đã tồn tại: Cập nhật thông tin avatar và tên nếu có thay đổi.
     * Nếu Email chưa tồn tại: Tạo mới người dùng với vai trò mặc định là `LEARNER`.
  5. Tạo cặp Token JWT:
     * `accessToken`: Lưu thông tin `id`, `email`, `role`, có thời hạn ngắn (ví dụ: 1 giờ).
     * `refreshToken`: Lưu mã ngẫu nhiên hoặc token ký riêng, thời hạn dài (ví dụ: 7 ngày) được mã hóa một chiều lưu vào DB để gia hạn.
  6. Trả về kết quả `201 Created` kèm thông tin tài khoản và cặp token.
* **Exception Flows**:
  * *Mã Google Token không hợp lệ hoặc hết hạn*: Ném lỗi `401 Unauthorized` kèm thông báo lỗi chi tiết.

### Use Case 2: Làm mới Token (Refresh Token)
* **Actor**: Học viên / Quản trị viên
* **Preconditions**: Trình duyệt/Client lưu trữ `refreshToken` hợp lệ.
* **Basic Flow**:
  1. Client gửi yêu cầu POST tới `/auth/refresh` kèm theo `refreshToken`.
  2. Hệ thống kiểm tra tính hợp lệ và thời hạn của token.
  3. Hệ thống đối chiếu `refreshToken` nhận được với mã hash lưu trong cơ sở dữ liệu của người dùng.
  4. Nếu khớp và hợp lệ, hệ thống tạo mới cặp `accessToken` và `refreshToken` mới.
  5. Lưu mã `refreshToken` mới vào DB và trả về cho Client.
* **Exception Flows**:
  * *Refresh Token bị sai lệch hoặc đã thu hồi*: Trả về lỗi `401 Unauthorized`.

---

## 2. Kịch bản BDD (Scenario - Gherkin)

### Kịch bản 1: Đăng nhập thành công với tài khoản đã tồn tại
```gherkin
Given Tài khoản email "learner.test@glinteco.com" đã tồn tại trong DB với vai trò "LEARNER"
When Người dùng gửi yêu cầu đăng nhập chứa Google idToken hợp lệ của email "learner.test@glinteco.com"
Then Hệ thống xác thực Google idToken thành công
  And Trả về mã HTTP Status "201 Created"
  And Trả về payload chứa "accessToken" và "refreshToken"
  And Không tạo thêm bản ghi User mới nào trong database
```

### Kịch bản 2: Google idToken không hợp lệ
```gherkin
Given Người dùng gửi một mã token giả lập "fake_token_123" lên hệ thống
When Người dùng gửi yêu cầu POST tới "/auth/google"
Then Hệ thống gọi thư viện kiểm tra và phát hiện token không hợp lệ
  And Trả về mã lỗi "401 Unauthorized"
  And Không cấp phát token JWT hệ thống
```

---

## 3. Ca Kiểm thử Chi tiết (Test Case Specification)

| Test Case ID | Mục tiêu kiểm thử | Dữ liệu đầu vào (Input) | Các bước thực hiện | Kết quả mong đợi (Expected Output) |
| :--- | :--- | :--- | :--- | :--- |
| **TC_AUTH_01** | Google Login thành công | Body: `{ "idToken": "google_token_valid" }` | 1. Gửi POST tới `/auth/google` kèm token hợp lệ. | HTTP 201 Created, trả về cặp token JWT cùng dữ liệu user. |
| **TC_AUTH_02** | Google Login thất bại do Token lỗi | Body: `{ "idToken": "google_token_invalid" }` | 1. Gửi POST tới `/auth/google` kèm token lỗi. | HTTP 401 Unauthorized. |
| **TC_AUTH_03** | Refresh Token thành công | Body: `{ "refreshToken": "refresh_token_valid" }` | 1. Gửi POST tới `/auth/refresh` với refresh token khớp DB. | HTTP 200 OK, trả về accessToken và refreshToken mới. |
| **TC_AUTH_04** | Refresh Token bị lỗi chữ ký / hết hạn | Body: `{ "refreshToken": "refresh_token_expired" }` | 1. Gửi POST tới `/auth/refresh` với token hết hạn hoặc sai chữ ký. | HTTP 401 Unauthorized. |
| **TC_AUTH_05** | Đăng ký người dùng mới bằng Email/Password thành công | Body: `{ "email": "new@example.com", "password": "SecurePassword123", "name": "New User" }` | 1. Gửi POST tới `/auth/register` với thông tin đăng ký hợp lệ. | HTTP 201 Created, trả về thông tin user mới đã ẩn mật khẩu. |
| **TC_AUTH_06** | Đăng ký người dùng thất bại do trùng Email | Body: `{ "email": "existing@example.com", "password": "SecurePassword123", "name": "Existing User" }` | 1. Gửi POST tới `/auth/register` với email đã tồn tại. | HTTP 400 Bad Request. |
| **TC_AUTH_07** | Đăng nhập bằng Email/Password thành công | Body: `{ "email": "user@example.com", "password": "CorrectPassword123" }` | 1. Gửi POST tới `/auth/login` với thông tin đăng nhập đúng. | HTTP 201 Created, trả về cặp token JWT. |
| **TC_AUTH_08** | Đăng nhập thất bại do sai mật khẩu hoặc tài khoản | Body: `{ "email": "user@example.com", "password": "WrongPassword" }` | 1. Gửi POST tới `/auth/login` với mật khẩu sai. | HTTP 401 Unauthorized. |
| **TC_AUTH_09** | Đăng xuất thành công | Header: `Authorization: Bearer <token>`<br>Body: `{ "refreshToken": "<refresh_token>" }` | 1. Gửi POST tới `/auth/logout` để thu hồi refresh token của user. | HTTP 201 Created, vô hiệu hóa refresh token trong DB. |
| **TC_AUTH_10** | Lấy thông tin cá nhân hiện tại | Header: `Authorization: Bearer <token>` | 1. Gửi GET tới `/auth/me` đính kèm JWT token hợp lệ. | HTTP 200 OK, trả về thông tin hồ sơ của chính mình. |
| **TC_AUTH_11** | Google Login thất bại do Server chưa cấu hình Google Client ID | Body: `{ "idToken": "valid-token" }` | 1. Gửi POST tới `/auth/google` khi biến môi trường `GOOGLE_CLIENT_ID` rỗng. | HTTP 500 Internal Server Error. |
| **TC_AUTH_12** | Google Login thất bại do Payload trả về từ Google rỗng | Body: `{ "idToken": "invalid-payload-token" }` | 1. Gửi POST tới `/auth/google` khi google-auth-library trả về payload null. | HTTP 401 Unauthorized. |
| **TC_AUTH_13** | Google Login thất bại do Email chưa xác thực | Body: `{ "idToken": "unverified-email-token" }` | 1. Gửi POST tới `/auth/google` khi email_verified trong token là false. | HTTP 401 Unauthorized. |
| **TC_AUTH_14** | Google Login thất bại do sai tên miền Email quy định | Body: `{ "idToken": "gmail-token" }` | 1. Gửi POST tới `/auth/google` khi tên miền email không khớp `ALLOWED_EMAIL_DOMAIN`. | HTTP 403 Forbidden. |
| **TC_AUTH_15** | Liên kết tài khoản Google mới với tài khoản đã có sẵn Email | Body: `{ "idToken": "google_token_valid" }` | 1. Gửi POST tới `/auth/google` với email đã đăng ký bằng mật khẩu trước đó. | HTTP 201 Created, cập nhật trường `googleId` cho user đó. |

---

## 4. Triển khai Unit Test bằng Jest (`auth.controller.spec.ts` & `auth.service.spec.ts`)

### 4.1. Unit Test cho Auth Controller
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    loginWithGoogle: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('TC_AUTH_01: should login with Google and return tokens', async () => {
    const dto = { idToken: 'valid-google-token' };
    const expectedResult = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      user: { email: 'user@gmail.com', role: 'learner' },
    };
    mockAuthService.loginWithGoogle.mockResolvedValue(expectedResult);

    const result = await controller.googleLogin(dto);

    expect(mockAuthService.loginWithGoogle).toHaveBeenCalledWith(dto.idToken);
    expect(result).toEqual(expectedResult);
  });
});
```

### 4.2. Unit Test cho Auth Service
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('refresh', () => {
    it('TC_AUTH_04: should throw UnauthorizedException if token validation fails', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

---

## 5. Kết Quả Kiểm Thử & Độ Bao Phủ (Test Results & Coverage Report)

Dưới đây là thống kê độ bao phủ (code coverage) thực tế của phân hệ Xác thực & Ủy quyền (Auth Module) thu được từ Jest:

| File / Thư mục | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **src/modules/auth** | **100%** | **83.62%** | **100%** | **100%** | |
| ├─ `auth.controller.ts` | 100% | 75% | 100% | 100% | 30-109 |
| └─ `auth.service.ts` | 100% | 91.66% | 100% | 100% | 46-51 |
| **src/modules/auth/guards** | **100%** | **90%** | **100%** | **100%** | |
| ├─ `jwt-auth.guard.ts` | 100% | 100% | 100% | 100% | |
| └─ `roles.guard.ts` | 100% | 90% | 100% | 100% | 14 |
| **src/modules/auth/strategies** | **100%** | **80%** | **100%** | **100%** | |
| └─ `jwt.strategy.ts` | 100% | 80% | 100% | 100% | 17 |

Các ca kiểm thử đã được chạy thành công và đạt độ bao phủ tuyệt đối về mặt dòng lệnh (Statements) và hàm (Functions), các nhánh logic rẽ nhánh (Branches) đạt trên 80% độ bao phủ.

