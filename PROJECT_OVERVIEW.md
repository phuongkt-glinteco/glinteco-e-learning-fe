# RAMP UP — Frontend Architecture Overview

> Tài liệu mentor cho frontend intern: hiểu kiến trúc project ở cấp độ đủ để review task, giao việc cho AI, debug flow và trả lời mentor.

---

## 1. Project này là gì?

**RAMP UP** — Cổng onboarding nội bộ gamified của Glinteco, giúp kỹ sư mới học lộ trình, nộp bài tập qua GitHub PR, tích lũy XP/Level/Streak.

- **Mục tiêu chính**: Đào tạo & ramp-up kỹ sư mới theo lộ trình track → lesson → exercise → submission (review PR).
- **User chính**: Learner (học viên mới) và Admin (Engineering Manager / Tech Lead).
- **Nhóm tính năng lớn hiện có**:
  1. **Auth** — Login email/password + Google OAuth, refresh token, role-based redirect.
  2. **Landing page** — Trang giới thiệu công khai (public).
  3. **Learning Tracks & Lessons** (learner) — Timeline track, chi tiết lesson, complete lesson nhận XP. **Đây là flow chính, đang active (CURRENT_TASK GLI-25).**
  4. **Dashboard** — Learner dashboard (stats) & Admin dashboard (cohort overview, submission feed).
  5. **Admin Create Track** — Tạo track + lessons (draft store + API).
  6. **(Placeholder)** Exercises, Leaderboard, Settings, Admin Cohorts, Admin Reviews — mới có skeleton UI, chưa kết API.

---

## 2. Kiến trúc tổng quan

| Khía cạnh | Công nghệ / vị trí |
|---|---|
| **Frontend framework** | Next.js 15 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 + Material Symbols icons + font Inter/JetBrains Mono |
| **Backend / API** | NestJS riêng ở `be/`, base URL cấu hình trong `fe/src/services/api-config.ts` (local `localhost:5000/api/v1`, prod `be-teal-tau.vercel.app`) |
| **Data fetching** | `@hey-api/client-fetch` — SDK **auto-gen từ OpenAPI** (`pnpm gen:api`). Không dùng React Query/SWR. Pattern: `useEffect` + `setState` trong container component. |
| **Auth** | `next-auth` v5 beta (Google OAuth) **+ custom email/password** gọi thẳng backend. Token lưu `localStorage`. Middleware bảo vệ route + redirect theo role. |
| **State management** | React Context cho global (Auth, ApiError, Language) + **zustand** (persist) cho draft form + local `useState` cho data fetching. |
| **Form / validation** | `react-hook-form` + `@hookform/resolvers/zod` + `zod`. Schemas ở `src/schemas/`. Error message là i18n key. |
| **i18n** | `next-intl` — vi (mặc định) / en, message files ở `fe/messages/`. |
| **UI component system** | `src/components/ui/` (primitives: Avatar, Badge, Button, Card, Modal, Skeleton...) + `src/components/layout/` (AppShell, Sidebar, Header) + `src/components/features/` (page-level containers/views theo domain). Pattern: **page.tsx → Container (state+API) → View (presentational)**. |

---

## 3. Folder structure

```text
fe/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (providers lồng nhau)
│   │   ├── page.tsx                  # Landing page (/)
│   │   ├── (auth)/                   # Route group: login, register, logout
│   │   ├── (authenticated)/          # Route group cần đăng nhập (có FeatureLayout)
│   │   │   ├── layout.tsx            # Bọc AppShell + Suspense
│   │   │   ├── dashboard/{admin,learner}/
│   │   │   ├── tracks/[trackId]/lessons/[lessonId]/
│   │   │   ├── courses/...           # Alias route của tracks
│   │   │   ├── admin/{cohorts,reviews,tracks/create}
│   │   │   └── exercises, leaderboard, settings  # Placeholder
│   │   ├── api/auth/                 # next-auth route handler
│   │   └── docs/                     # Trang xem docs
│   ├── components/
│   │   ├── features/                 # Page-level theo domain
│   │   │   ├── auth/                 # LoginPage, RegisterPage, LogoutPage
│   │   │   ├── dashboard/{admin,learner}/
│   │   │   └── tracks/               # learner/, detail/, components/, CreateTrackPage
│   │   ├── layout/                   # AppShell, Sidebar, Header, NavMenu...
│   │   └── ui/                       # Primitives + index.ts barrel export
│   ├── features/landing/             # Landing page tách riêng (containers + components)
│   ├── providers/                    # AuthProvider, SessionProvider, ApiErrorProvider, LanguageProvider
│   ├── services/                     # API LAYER
│   │   ├── api-client.ts             # Wrapper: token mgmt + 401 refresh interceptor
│   │   ├── api-config.ts             # Base URL config
│   │   ├── client/                   # AUTO-GEN từ OpenAPI (đừng sửa tay)
│   │   ├── error-mapper.ts           # Map HTTP error → AppError code
│   │   ├── errors.ts                 # AppError, HttpError, ValidationError
│   │   └── login-schema.ts           # (legacy, trùng authSchemas)
│   ├── schemas/                      # Zod schemas theo domain (auth, track, cohort...)
│   ├── stores/                       # Zustand stores (trackDraftStore)
│   ├── hooks/                        # useMediaQuery
│   ├── lib/                          # auth.ts (next-auth config), md-renderer, time-utils
│   ├── i18n/                         # request.ts (server config), locales.ts
│   ├── mocks/                        # Mock data (landing)
│   ├── types/                        # next-auth.d.ts (augment session)
│   ├── utils/                        # track-icons...
│   └── middleware.ts                 # Route protection + role redirect
├── messages/                         # vi.json, en.json
├── package.json                      # scripts: dev (port 6336), gen:api, gen:api:remote
└── next.config.mjs                   # Alias '@' → src/, next-intl plugin
```

---

## 4. Luồng chạy tổng thể của app

```text
User mở URL
  │
  ▼
middleware.ts  ── kiểm tra session (next-auth) HOẶC cookie 'auth_verified'
  │                    │
  │ (chưa auth)        │ (đã auth)
  ▼                    ▼
redirect → /login    tiếp tục route
  │                    │
  ▼                    ▼
LoginPage.tsx      app/(authenticated)/layout.tsx
  │                    │
  │ useEffect          ▼
  ▼                  FeatureLayout → AppShell (Sidebar + Header + main)
AuthProvider          │
  │                    ▼
  │ login()            page.tsx (chỉ 1 dòng: render <Container />)
  ▼                    │
postAuthLogin          ▼
  │                  Container Component ('use client')
  ▼                    │ useState(loading, data, error)
saveTokens             │ useEffect → gọi SDK function (services/api-client)
  │                    │   vd: getTracks(), getTracksById()...
  ▼                    ▼
getAuthMe            Backend Endpoint (/api/v1/tracks ...)
  │                    │
  ▼                    ▼
setAuthCookie        normalize response → setState
  │                    │
  ▼                    ▼
redirect theo role   UI: loading (Skeleton) → success (View) → error (retry)
  │                      | empty state
  ▼
/dashboard/learner hoặc /dashboard/admin
```

**Key points:**

- `page.tsx` luôn chỉ là 1 dòng render `<Container />` (tách bạch routing khỏi logic).
- Container là `'use client'`, giữ `loading/data/error` state, gọi API qua `services/api-client`.
- Response từ backend đi qua `normalize*` functions (ở `components/features/tracks/learner/utils.ts`) trước khi setState — đây là lớp **adapter** chống contract mismatch.
- Lỗi API → `error-mapper.ts` → dispatch event `api-error` → `ApiErrorProvider` hiển thị toast 5s.

---

## 5. Mapping màn hình → file → API

| Màn hình / route | File page | Component chính | Hook / API service | Backend endpoint | Data chính |
|---|---|---|---|---|---|
| Landing `/` | `app/page.tsx` | `features/landing/containers/landing-page-container.tsx` | `getTranslations` (i18n) + `mocks/landing` | — (static) | Hero, curriculum stages, activity flow |
| Login `/login` | `app/(auth)/login/page.tsx` | `components/features/auth/LoginPage.tsx` | `useAuth().login()` / `loginWithGoogle()` | `POST /auth/login`, `POST /auth/google`, `GET /auth/me` | Tokens, user profile |
| Register `/register` | `app/(auth)/register/page.tsx` | `components/features/auth/RegisterPage.tsx` | `postAuthRegister` | `POST /auth/register` | Created user |
| Learner Dashboard `/dashboard/learner` | `.../dashboard/learner/page.tsx` | `LearnerDashboardPage` → các Section con | `getUsersMeStats`, `getDocumentsRecent`... | `GET /users/me/stats`, `GET /documents/recent` | Stats, continue learning, activity |
| Admin Dashboard `/dashboard/admin` | `.../dashboard/admin/page.tsx` | `AdminDashboardPage` | `getCohorts`, `getCohortsByIdOverview`, `getSubmissions`, `getCohortsByIdTrackCompletion` | `GET /cohorts`, `GET /cohorts/{id}/overview`, `GET /submissions?cohortId=`, `GET /cohorts/{id}/track-completion` | Cohort stats, submission feed, velocity chart |
| Tracks list `/tracks` (hoặc `/courses`) | `.../tracks/page.tsx` | `TracksContainer` → `TracksTimeline` | `fetchCourses()` trong `courseLearningApi.ts` | `GET /tracks` | Track list + status (completed/in_progress/locked) |
| Track detail `/tracks/[trackId]` | `.../tracks/[trackId]/page.tsx` | `CourseDetailContainer` → `CourseDetailView` | `fetchCourseDetail(trackId)` | `GET /tracks/{id}`, `GET /tracks/{id}/lessons` | Track info + lessons list + progress |
| Lesson detail `/tracks/[trackId]/lessons/[lessonId]` | `.../lessons/[lessonId]/page.tsx` | `LessonDetailContainer` → `LessonDetailView` | `fetchLessonPage()`, `completeLesson()` | `GET /tracks/{id}`, `GET /tracks/{id}/lessons`, `GET /lessons/{id}` (qua client.get), `GET /exercises?trackId=`, `POST /lessons/{id}/complete` | Lesson body, exercises, XP award |
| Admin Create Track `/admin/tracks/create` | `.../admin/tracks/create/page.tsx` | `CreateTrackPage` | `useTrackDraftStore` (zustand) + `postTracks`, `postTracksByIdLessons` | `POST /tracks`, `POST /tracks/{id}/lessons` | Draft track + lessons |
| Exercises `/exercises` | — | (placeholder) | — | — | — |
| Leaderboard `/leaderboard` | — | (placeholder) | `getLeaderboard` (SDK có sẵn) | `GET /leaderboard` | — |
| Settings `/settings` | — | (placeholder) | `patchUsersMe` (SDK có sẵn) | `PATCH /users/me` | — |
| Admin Cohorts `/admin/cohorts` | — | (placeholder) | `getCohorts`, `postCohorts`, `patchCohortsById` | `GET/POST /cohorts`, `PATCH /cohorts/{id}` | — |
| Admin Reviews `/admin/reviews` | — | (placeholder) | `getSubmissions`, `postSubmissionsByIdApprove`, `postSubmissionsByIdRequestChanges` | `GET /submissions`, `POST /submissions/{id}/approve`, `POST /submissions/{id}/request-changes` | — |

---

## 6. Data flow chi tiết cho các flow quan trọng

### Flow 1: Login (email/password)

```text
User nhập email/password → submit form
  │
  ▼
LoginPage.tsx.onSubmit(data)
  │ react-hook-form + zodResolver validate trước
  ▼
useAuth().login(email, password)  [AuthProvider.tsx:103]
  │
  ▼
postAuthLogin({ body: { email, password } })  [sdk.gen.ts]
  │
  ▼
Backend: POST /api/v1/auth/login
  │
  ▼
Response: { user, accessToken, refreshToken, expiresIn }
  │
  ▼
saveTokens(accessToken, refreshToken) → localStorage + client.setConfig({ auth })
setAuthCookie(role) → document.cookie 'auth_verified=learner'
getAuthMe() → GET /auth/me (lấy profile đầy đủ)
  │
  ▼
setUser(profile), setToken(token)
  │
  ▼
useEffect trong LoginPage: router.replace('/dashboard/learner' hoặc '/admin')
  │
  ▼
middleware.ts: cookie 'auth_verified' đã có → cho qua → render Dashboard
```

**Lỗi có thể xảy ra:**

- Sai credentials → backend trả 401 → `error-mapper` map thành `LOGIN_INVALID_CREDENTIALS` → hiển thị message.
- Backend down / network → `NETWORK_ERROR`.
- `getAuthMe` fail sau khi login thành công (token expire) → attempt `postAuthRefresh` → nếu fail → clearTokens.

### Flow 2: Danh sách Tracks (learner)

```text
User vào /tracks (hoặc /courses — alias)
  │
  ▼
middleware: đã auth → cho qua
  │
  ▼
(authenticated)/layout.tsx → FeatureLayout → AppShell → render children
  │
  ▼
tracks/page.tsx → <TracksContainer />
  │
  ▼
TracksContainer (useEffect) → fetchCourses()  [courseLearningApi.ts:61]
  │
  ▼
getTracks({ throwOnError: true })  [sdk.gen.ts:284]
  │
  ▼
Backend: GET /api/v1/tracks (Authorization: Bearer <token>)
  │
  ▼
Response: { data: TrackSummary[] } (mỗi item có id, title, status, lessonsCompleted...)
  │
  ▼
normalizeTrackSummaries() → map contract → LearnerTrack[] (fallback icon, status, sort theo order)
  │
  ▼
setTracks(courses), setLoading(false)
  │
  ▼
UI states:
  - loading → <TracksLoadingState /> (Skeleton)
  - error → <TracksErrorState message onRetry={loadTracks} />
  - success → <TracksTimeline tracks={tracks} onOpenTrack={...} />
```

**Click vào track:** `handleOpenTrack(track)` → nếu `status !== 'locked'` → `router.push('/courses/${track.id}')`.

### Flow 3: Chi tiết Lesson + Complete Lesson

```text
User vào /tracks/[trackId]/lessons/[lessonId]
  │
  ▼
LessonDetailContainer (useEffect) → fetchLessonPage(courseId, lessonId)
  │
  ▼
Promise.all([
  fetchCourseDetail(courseId)    → GET /tracks/{id} + GET /tracks/{id}/lessons
  fetchLessonDetail(lessonId)    → client.get /lessons/{id}  (raw, không có SDK gen)
  fetchLessonExercises(courseId, lessonId)
    → client.get /lessons/{id}/exercises
      (fallback: GET /exercises?trackId= courseId, filter theo lessonId)
])
  │
  ▼
normalize* → setState: track, lessons, activeLesson, exercises
  │
  ▼
UI: <LessonDetailView ... onCompleteLesson={handleCompleteLesson} />
  │
  ▼
User click "Complete Lesson"
  │
  ▼
handleCompleteLesson()
  │
  ▼
postLessonsByIdComplete({ path: { id: lessonId } })
  │
  ▼
Backend: POST /api/v1/lessons/{id}/complete
  │
  ▼
Response: { xpAwarded, lessonsCompleted, trackStatus, totalXp, unlockedTrackId }
  │
  ▼
setCompletionMessage(`Lesson completed. +${xpAwarded} XP awarded.`)
setActiveLesson({ ...activeLesson, completed: true })
setTrack({ ...track, lessonsCompleted, status })
await loadLessonData()  ← refetch toàn bộ
```

**Lỗi có thể xảy ra:**

- Backend trả `xpAwarded` thiếu → fallback `DEFAULT_LESSON_XP = 40` (utils.ts:24).
- Lesson 404 → `LessonErrorState` với "Lesson not found".
- Lesson exercises endpoint chưa có → fallback sang `getExercises?trackId=` rồi filter client-side.

### Flow 4: Admin Create Track

```text
User vào /admin/tracks/create → <CreateTrackPage />
  │
  ▼
useTrackDraftStore (zustand + persist)  ← state: title, description, lessons[]
  │
  ▼
User edit BasicInfoCard, add lessons trong CurriculumSection
  │ (state persist qua reload nhờ zustand persist middleware)
  ▼
Click "Create Track" → handleSave()
  │
  ▼
postTracks({ body: { title, description, estimatedTime, lessonCount } })
  │
  ▼
Backend: POST /api/v1/tracks → { id }
  │
  ▼
Promise.all(lessons.map(postTracksByIdLessons))  ← tạo tất cả lesson song song
  │
  ▼
Backend: POST /api/v1/tracks/{id}/lessons (cho mỗi lesson)
  │
  ▼
reset() (clear draft store) → router.push('/admin/tracks/${trackId}')
```

---

## 7. Những khái niệm cần hiểu để maintain project

### Cần hiểu kỹ để làm việc

- **App Router route groups** `(auth)` / `(authenticated)` — nhóm route không ảnh hưởng URL, chỉ để chia layout.
- **Container / Presentational pattern** — `page.tsx` chỉ render container; container giữ state + gọi API; view chỉ nhận props.
- **API client layer** (`services/api-client.ts`) — token management, 401 auto-refresh interceptor, error event dispatch. Hiểu `saveTokens`, `clearTokens`, `setClientToken`, `attemptTokenRefresh`.
- **Auth dual mechanism** — next-auth (Google) + custom email/password; cookie `auth_verified` để middleware check mà không cần query session. Xem `AuthProvider.tsx` + `middleware.ts` + `lib/auth.ts`.
- **OpenAPI codegen** — chạy `pnpm gen:api` (từ `docs/docs.json`) hoặc `pnpm gen:api:remote` (từ URL backend). **Không sửa tay** `services/client/*`.
- **Normalize layer** (`components/features/tracks/learner/utils.ts`) — adapter giữa API contract và UI types, chống crash khi field thiếu/khác type.

### Chỉ cần biết để đọc code

- **Zod schemas** (`src/schemas/`) — validation + types. Error message là i18n key, không phải string raw.
- **Error mapping** (`error-mapper.ts`) — map HTTP status → code (`LOGIN_INVALID_CREDENTIALS`, `NOT_FOUND`, `NETWORK_ERROR`...) → `ApiErrorProvider` show toast.
- **next-intl** — `useTranslations` ở client, `getTranslations` ở server. Locale lưu cookie `NEXT_LOCALE`.
- **zustand persist** — `trackDraftStore` lưu localStorage key `track-draft`.

### Chưa cần đào sâu lúc này

- Markdown rendering (`lib/md-renderer/`).
- CRT scanline / retro aesthetic CSS (globals.css).
- Backend NestJS (`be/`).
- OpenAPI spec chi tiết (`docs/openapi.yaml`, `docs/docs.json`).
- Test-ui routes (`app/(test-ui)/`, `app/(test-ui-app-shell)/`) — chỉ là playground.

---

## 8. Những điểm rủi ro / dễ bug

1. **Dual auth state không đồng bộ** — `AuthProvider` sync giữa next-auth session (Google) và localStorage token (email/password). Có nhiều nhánh fallback, dễ race condition khi refresh. `AuthProvider.tsx:48-101`.

2. **Cookie `auth_verified` lưu role plain text** — middleware tin tưởng cookie này để redirect theo role. Nếu cookie bị tamper → redirect sai (dù backend vẫn check token thật). `middleware.ts:44-47`.

3. **Login page hardcode default credentials** — `alice@glinteco.com` / `rampup123` trong `LoginPage.tsx:46-48`. Quên xóa trước production.

4. **Route alias /tracks vs /courses** — cùng dùng `TracksContainer`, và `CourseDetailContainer` đọc `params.courseId ?? params.trackId`. Nếu đổi tên param mà không cập nhật fallback → break. `CourseDetailContainer.tsx:77`.

5. **Raw client.get bypass SDK** — `fetchLessonDetail` và `fetchLessonExercises` dùng `client.get` trực tiếp với URL `/lessons/{id}` thay vì SDK function (vì endpoint có thể chưa được gen). Nếu backend đổi contract → không có type check. `courseLearningApi.ts:94-139`.

6. **Contract mismatch phòng thủ thủ công** — `normalize*` functions xử lý nhiều trường `?? fallback`. Nếu backend thêm field mới mà UI không normalize → UI không nhận. Cần kiểm tra `types.gen.ts` vs `LearnerTrack` type.

7. **Interceptor 401 trigger logout** — khi refresh fail, dispatch event `SESSION_EXPIRED` + gọi `onSessionExpired`. Nếu callback chưa register (provider chưa mount) → chỉ clearTokens, không redirect → user kẹt trên page lỗi. `api-client.ts:108-120`.

8. **Admin Dashboard fetch song song** — `Promise.all` 3 API; nếu 1 fail → cả `catch` → hiển thị error toàn dashboard. Không có partial fallback. `AdminDashboardPage.tsx:104-117`.

9. **Placeholder pages chưa kết API** — Exercises, Leaderboard, Settings, Admin Cohorts/Reviews mới có `<h1>` text, chưa có container. Nếu assign task vào đây → phải build từ đầu.

10. **`login-schema.ts` trùng `authSchemas.ts`** — có 2 file schema login song song. Ưu tiên dùng `src/schemas/` (barrel export qua `index.ts`).

---

## 9. Khi nhận task mới — checklist đọc theo thứ tự

1. **Đọc `CURRENT_TASK.md`** ở root — chứa issue hiện tại, scope, route dự kiến, DoD.
2. **Tìm route**: vào `fe/src/app/` tìm theo cấu trúc thư mục. Route group `(auth)` / `(authenticated)` không tính vào URL.
3. **Tìm page component**: mở `page.tsx` tương ứng → xem nó import Container nào (thường chỉ 1 dòng).
4. **Tìm API**:
   - Nếu task cần gọi API mới → xem `fe/src/services/client/sdk.gen.ts` (list tất cả function có sẵn) hoặc chạy `pnpm gen:api:remote` để regen.
   - Nếu function có sẵn → import từ `@/services/api-client`.
   - Nếu chưa có → kiểm tra `docs/openapi.yaml` / `docs/docs.json` xem backend đã có endpoint chưa.
5. **Tìm type**: `fe/src/services/client/types.gen.ts` (auto-gen từ backend) + `fe/src/schemas/` (zod, dùng cho form).
6. **Tìm UI component**:
   - Primitives → `fe/src/components/ui/` (barrel `index.ts`).
   - Layout → `fe/src/components/layout/`.
   - Feature-specific → `fe/src/components/features/<domain>/`.
7. **Kiểm tra pattern**: page mới phải tuân thủ `page.tsx → Container ('use client') → View`. Container giữ `loading/data/error` state qua `useEffect` + SDK function. Xem `TracksContainer.tsx` làm mẫu.
8. **Test flow**: `pnpm dev` (port 6336) → login bằng `alice@glinteco.com` / `rampup123` → vào route → kiểm tra loading/success/error states → `pnpm lint` + `pnpm build`.

---

## 10. Giải thích lại bằng ví dụ thực tế

Tính năng: **"Thêm nút 'Mark as In Progress' trên Lesson Detail"** (giả định task).

### Muốn sửa UI thì xem đâu

- Mở `fe/src/components/features/tracks/learner/LessonDetailView.tsx` — đây là presentational component render lesson.
- Tìm chỗ có nút "Complete Lesson" hiện tại → thêm nút "Mark as In Progress" cạnh đó.
- Style: dùng Tailwind classes, tham khảo nút hiện tại (`bg-primary`, `rounded-lg`, `label-md`...). Icon dùng `<span className="material-symbols-outlined">icon_name</span>`.

### Muốn đổi API thì xem đâu

- Giả sử backend thêm endpoint `POST /lessons/{id}/in-progress`.
- Bước 1: chạy `pnpm gen:api:remote` để regen `services/client/sdk.gen.ts` + `types.gen.ts`.
- Bước 2: trong `courseLearningApi.ts` thêm function `markLessonInProgress(lessonId)` gọi `postLessonsByIdInProgress({ path: { id: lessonId } })`.
- Bước 3: trong `LessonDetailContainer.tsx` thêm `handleMarkInProgress` giống `handleCompleteLesson` nhưng gọi function mới.
- Bước 4: truyền prop `onMarkInProgress` xuống `LessonDetailView`.

### Muốn thêm loading/error thì sửa đâu

- Trong `LessonDetailContainer.tsx` đã có sẵn `loading`, `error`, `completing` state + `LessonLoadingState` / `LessonErrorState` components.
- Thêm state `markingInProgress` (boolean) → truyền xuống view → disable nút khi đang gọi.
- Try/catch trong handler → `setCompletionError(message)` (đã có sẵn pattern).

### Muốn debug lỗi không hiện data thì kiểm tra theo thứ tự

1. **Mở DevTools → Network**: request `/api/v1/tracks` (hoặc endpoint liên quan) có gửi không? Status bao nhiêu?
2. **Check Authorization header**: có `Bearer <token>` không? Nếu không → token chưa set → xem `api-client.ts:10-15` + `AuthProvider`.
3. **Nếu 401**: interceptor có thử refresh không? Xem tab Network có request `/auth/refresh` theo sau không. Nếu refresh fail → cookie `auth_verified` có bị clear không?
4. **Nếu 200 nhưng UI trống**: response `data` có giá trị không? → kiểm tra `normalize*` function có filter bỏ hết không (thường do `id` thiếu → `normalizeTrackSummary` return `null`).
5. **Nếu error toast hiện mã lạ**: tra `error-mapper.ts` switch case + `messages/vi.json` có key tương ứng không.
6. **Console errors**: `useTranslations` throw nếu thiếu key i18n → kiểm tra `messages/vi.json` có namespace đúng không (vd `LoginPage.emailRequired`).

---

**Tóm lại:** Project RAMP UP FE là Next.js 15 App Router dùng pattern Container/View, API auto-gen từ OpenAPI, auth dual (next-auth + custom), state chia Context + zustand. Flow chính hiện tại là Learning Tracks & Lessons (đang active theo CURRENT_TASK). Khi nhận task: đọc `CURRENT_TASK.md` → tìm route trong `app/` → mở page.tsx → follow Container → xem `services/api-client` + `services/client/sdk.gen.ts`. Chỗ dễ bug nhất là auth dual mechanism và contract mismatch giữa API gen và normalize layer.
