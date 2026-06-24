# Sơ đồ Luồng Đăng nhập Google (Google Auth Flow)

Tài liệu này mô tả chi tiết luồng đăng nhập bằng Google OAuth 2.0 trong hệ thống **RAMP UP**, bao gồm cả bước xử lý trên Frontend và Backend (NestJS).

## 1. Sơ đồ trình tự (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Client as Frontend (Next.js)
    participant GoogleSDK as Google GSI SDK
    participant API as Backend (NestJS)
    participant DB as Database (Postgres)

    User->>Client: Click nút "Sign in with Google"
    Client->>GoogleSDK: Kích hoạt Google One-Tap/Login Popup
    GoogleSDK->>User: Hiển thị hộp thoại chọn tài khoản Google
    User->>GoogleSDK: Chọn tài khoản & Xác thực
    GoogleSDK->>Client: Trả về ID Token (signed JWT)
    
    Client->>API: POST /api/v1/auth/google { idToken }
    
    rect rgb(200, 220, 240)
        note right of API: Xử lý tại Backend
        API->>API: verifyGoogleToken(idToken) via Google Library
        alt Token không hợp lệ / Hết hạn
            API-->>Client: Trả về lỗi 401 Unauthorized
        end
        API->>API: Kiểm tra email_verified == true
        API->>API: assertAllowedDomain (Kiểm tra domain công ty)
        alt Không thuộc domain được phép (ALLOWED_EMAIL_DOMAIN)
            API-->>Client: Trả về lỗi 403 Forbidden
        end
    end

    API->>DB: findOrCreateUser (Tìm user theo email)
    alt Chưa tồn tại tài khoản
        API->>DB: Tạo User mới (Role: LEARNER, Lvl: 1, XP: 0)
    else Tồn tại tài khoản nhưng chưa liên kết Google
        API->>DB: Cập nhật googleId (sub claim)
    end
    DB-->>API: Trả về thông tin User
    
    API->>API: Tạo accessToken (15m) & refreshToken (7d)
    API->>DB: Lưu hash Refresh Token (jti, expiresAt, userId)
    DB-->>API: Thành công
    
    API-->>Client: Trả về AuthResponseDto { accessToken, refreshToken, user }
    Client->>Client: Lưu tokens vào Cookie / LocalStorage
    Client->>User: Chuyển hướng về trang Dashboard
```

---

## 2. Chi tiết các bước xử lý

### Bước 1: Phía Frontend (Client-side)
1. Người dùng kích hoạt đăng nhập bằng Google.
2. Google GSI SDK thực hiện xác thực và trả về một chuỗi `idToken` (được ký bởi khóa bí mật của Google).
3. Frontend gửi request `POST /api/v1/auth/google` đính kèm `idToken` lên Backend.

### Bước 2: Phía Backend (Server-side)
1. **Xác thực Token (`verifyGoogleToken`)**:
   - Sử dụng thư viện `google-auth-library` của Google để verify chữ ký và hạn sử dụng của `idToken` với Client ID của dự án.
   - Nếu lỗi hoặc token giả mạo, ném ra lỗi `401 Unauthorized`.
2. **Kiểm tra Xác thực Email**:
   - Xác thực claim `email_verified` từ Google gửi về phải là `true`.
3. **Kiểm tra Tên miền Doanh nghiệp (`assertAllowedDomain`)**:
   - Nếu cấu hình biến `ALLOWED_EMAIL_DOMAIN` (ví dụ: `glinteco.com`): Hệ thống sẽ đối chiếu với claim hosted domain (`hd`) hoặc hậu tố email của user.
   - Nếu không khớp, ném ra lỗi `403 Forbidden` từ chối truy cập.
4. **Đồng bộ hóa User (`findOrCreateUser`)**:
   - Truy vấn database tìm user theo email.
   - **Trường hợp chưa tồn tại:** Tạo mới bản ghi User với thông tin `email`, `name`, `googleId` (tương ứng với claim `sub` của Google), đặt vai trò mặc định là `LEARNER` và các thông số game hóa ban đầu.
   - **Trường hợp đã tồn tại nhưng chưa liên kết Google:** Cập nhật trường `googleId` của user.
5. **Cấp phát Phiên làm việc (`issueTokens`)**:
   - Tạo UUID ngẫu nhiên làm định danh token (`jti`).
   - Ký `accessToken` (hạn 15 phút) chứa thông tin cơ bản của user.
   - Ký `refreshToken` (hạn 7 ngày) chứa `jti` và `rememberMe`.
   - Băm SHA-256 mã `refreshToken` và lưu vào bảng `refresh_tokens` cùng thời gian hết hạn (`expiresAt`).
6. **Phản hồi**:
   - Trả về cặp token và thông tin tài khoản user đã làm sạch (không kèm password).
