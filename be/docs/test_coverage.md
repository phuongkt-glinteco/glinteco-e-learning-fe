# Báo Cáo Độ Bao Phủ Kiểm Thử (Test Coverage Report)

Dự án **RAMP UP Backend** sử dụng Jest để thực hiện kiểm thử tự động bao gồm Unit Tests và Integration/End-to-End (E2E) Tests. Dưới đây là báo cáo chi tiết về độ bao phủ kiểm thử thực tế.

---

## 1. Kết quả Tổng quan (Summary Results)

* **Tổng số Unit Test Suites:** 28/28 passed (100%)
* **Tổng số Unit Tests:** 255/255 passed (100%)
* **Tổng số E2E Test Suites:** 4/4 passed (100%)
* **Tổng số E2E Tests:** 23/23 passed (100%)

---

## 2. Bảng Độ Bao Phủ Unit Test (Unit Test Coverage Table)

Dữ liệu dưới đây được xuất trực tiếp từ câu lệnh `pnpm run test:cov` (Jest Coverage Reporter):

| File / Thư mục | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **All files** | **95.01** | **73.17** | **93.33** | **95.42** | |
| **src** | **100** | **75** | **100** | **100** | |
| ├─ `app.controller.ts` | 100 | 75 | 100 | 100 | 6 |
| └─ `app.service.ts` | 100 | 100 | 100 | 100 | |
| **src/cohort** | **96.91** | **66.66** | **96.55** | **96.75** | |
| ├─ `cohort.controller.ts` | 100 | 68.75 | 100 | 100 | 35-109 |
| └─ `cohort.service.ts` | 96.09 | 66.25 | 95 | 95.9 | 169-170, 241-242 |
| **src/documents** | **96.17** | **75.7** | **93.75** | **97.94** | |
| ├─ `documents.controller.ts` | 100 | 75 | 100 | 100 | 44-143 |
| └─ `documents.service.ts` | 94.95 | 75.9 | 90 | 97.27 | 36, 109-110 |
| **src/exercises** | **85.22** | **58.33** | **93.33** | **88.6** | |
| ├─ `exercises.controller.ts` | 100 | 75 | 100 | 100 | 34-75 |
| └─ `exercises.service.ts` | 79.36 | 53.57 | 88.88 | 83.92 | 149, 168-173, 183 |
| **src/leaderboard** | **96.49** | **77.55** | **100** | **96.15** | |
| ├─ `leaderboard.controller.ts` | 100 | 75 | 100 | 100 | 25-37 |
| └─ `leaderboard.service.ts` | 95.55 | 78.37 | 100 | 95.23 | 41, 122 |
| **src/modules/auth** | **100** | **83.33** | **100** | **100** | |
| ├─ `auth.controller.ts` | 100 | 75 | 100 | 100 | 32-129 |
| └─ `auth.service.ts` | 100 | 92.42 | 100 | 100 | 46-51 |
| **src/modules/auth/guards** | **100** | **90** | **100** | **100** | |
| ├─ `jwt-auth.guard.ts` | 100 | 100 | 100 | 100 | |
| └─ `roles.guard.ts` | 100 | 90 | 100 | 100 | 14 |
| **src/modules/auth/strategies** | **100** | **80** | **100** | **100** | |
| └─ `jwt.strategy.ts` | 100 | 80 | 100 | 100 | 17 |
| **src/modules/users** | **100** | **77.02** | **100** | **100** | |
| ├─ `users.controller.ts` | 100 | 78.57 | 100 | 100 | 41-59, 71-80 |
| └─ `users.service.ts` | 100 | 76.08 | 100 | 100 | 23-31, 161-175 |
| **src/notifications** | **100** | **80** | **100** | **100** | |
| ├─ `notifications.controller.ts` | 100 | 75 | 100 | 100 | 25-41 |
| └─ `notifications.service.ts` | 100 | 87.5 | 100 | 100 | 10 |
| **src/search** | **100** | **76.92** | **100** | **100** | |
| ├─ `search.controller.ts` | 100 | 75 | 100 | 100 | 18-31 |
| └─ `search.service.ts` | 100 | 78.57 | 100 | 100 | 14-16 |
| **src/submissions** | **88.35** | **67.3** | **100** | **88.57** | |
| ├─ `submissions.controller.ts` | 100 | 75 | 100 | 100 | 40-107 |
| └─ `submissions.service.ts` | 84.68 | 65.47 | 100 | 85.04 | 73-274, 288, 294 |
| **src/tracks** | **92.92** | **74.19** | **80** | **92.93** | |
| ├─ `tracks.controller.ts` | 100 | 75 | 100 | 100 | 40-69, 42-105 |
| └─ `tracks.service.ts` | 91.42 | 74.02 | 73.17 | 91.48 | 84, 499, 541, 591 |

---

## 3. Kết quả Kiểm thử E2E (End-to-End Test Results)

Chạy bằng câu lệnh `pnpm run test:e2e`:

* `test/app.e2e-spec.ts` - **PASS**
* `test/users.e2e-spec.ts` - **PASS**
* `test/auth-perf.e2e-spec.ts` - **PASS** (Đo lường hiệu năng API đăng ký, đăng nhập và lấy hồ sơ cá nhân)
* `test/auth.e2e-spec.ts` - **PASS**

**Chi tiết hiệu năng API thu được từ E2E Performance tests:**
* API Đăng ký (Registration API): ~`140ms`
* API Đăng nhập (Login API): ~`120ms`
* API Lấy thông tin cá nhân (Profile Retrieval `/me` API): ~`5.5ms`

---

## 4. Hướng dẫn chạy Test (How to run tests)

Để chạy kiểm thử cục bộ, hãy chắc chắn bạn đã cài đặt đầy đủ các dependencies trong thư mục `be/` và chạy lệnh sau:

### Chạy toàn bộ Unit Tests
```bash
pnpm run test
```

### Chạy Unit Tests và xuất báo cáo Độ bao phủ (Coverage)
```bash
pnpm run test:cov --runInBand
```

### Chạy toàn bộ E2E/Integration Tests
```bash
pnpm run test:e2e --runInBand
```
