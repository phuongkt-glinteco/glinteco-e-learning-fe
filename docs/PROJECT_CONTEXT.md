# PROJECT_CONTEXT.md

## 1. Project này làm gì?

RAMP UP là cổng e-learning/onboarding nội bộ cho Glinteco. App phục vụ hai nhóm chính:

- Learner: học theo course/track, xem lesson, làm exercise, nộp bài và theo dõi tiến độ.
- Admin/Tech Lead: quản lý track, lesson, exercise, cohort, review submission và dashboard vận hành.

Flow sản phẩm đang nổi bật nhất hiện tại là learner course flow: danh sách courses/tracks -> course detail -> lesson detail -> complete/continue lesson. Phần admin track/exercise đã có màn tạo/sửa, nhưng learner exercise page vẫn còn sơ khai.

## 2. Tech stack đang dùng

Frontend (`fe/`):

- Next.js 15 App Router, React 19, TypeScript.
- Tailwind CSS v4.
- `next-auth` v5 beta cho Google/session, kết hợp custom email/password auth qua backend.
- `next-intl` cho i18n (`fe/messages/vi.json`, `fe/messages/en.json`).
- `@hey-api/openapi-ts` + `@hey-api/client-fetch` để generate SDK từ OpenAPI.
- `react-hook-form`, `zod`, `@hookform/resolvers` cho form/validation.
- `zustand` cho draft state, hiện thấy rõ ở track draft.

Backend (`be/`):

- NestJS 11, TypeScript.
- TypeORM, PostgreSQL, Redis/ioredis.
- Swagger/OpenAPI.
- Jest cho unit/e2e test.

## 3. Folder structure quan trọng

- `fe/src/app/`: Next.js App Router. Route groups chính: `(auth)`, `(authenticated)`, `(focus)`.
- `fe/src/components/features/`: component theo domain. Các domain đang quan trọng: `tracks`, `courses`, `my-courses`, `dashboard`, `auth`.
- `fe/src/components/features/tracks/learner/`: learner course/track/lesson flow, gồm container, view, normalizer và API adapter.
- `fe/src/components/features/tracks/exercises/`: form tạo/sửa exercise cho admin.
- `fe/src/components/layout/`: AppShell, Sidebar, Header, navigation.
- `fe/src/components/ui/`: UI primitives như button, card, loading, fallback, modal.
- `fe/src/services/`: API base/client, error mapper, generated API client.
- `fe/src/services/client/`: generated SDK/types từ OpenAPI, không nên sửa tay.
- `fe/src/schemas/`: zod schemas theo domain.
- `fe/src/providers/`: AuthProvider, ApiErrorProvider, LanguageProvider, SessionProvider.
- `be/src/`: NestJS modules/controllers/services/entities/migrations.
- `docs/`: tài liệu sản phẩm/API/design.
- `CURRENT_TASK.md`: task gần nhất mà Codex đang theo.

## 4. Route/page chính

Public/auth:

- `/`: landing page.
- `/login`, `/register`, `/logout`.
- `/docs`, `/error`.

Learner/authenticated:

- `/dashboard/learner`: learner dashboard.
- `/courses`: course catalog.
- `/courses/[courseId]`: course detail.
- `/courses/[courseId]/lessons/[lessonId]`: lesson detail.
- `/tracks`: track timeline/list, hiện điều hướng canonical sang `/courses/...`.
- `/tracks/[trackId]`, `/tracks/[trackId]/lessons/[lessonId]`: alias route cho course/lesson.
- `/my-courses`: khóa học đang học/đã hoàn thành.
- `/exercises`: hiện mới là placeholder đơn giản.
- `/leaderboard`, `/settings`: có route nhưng cần kiểm tra mức hoàn thiện trước khi làm tiếp.

Admin/authenticated:

- `/admin`, `/dashboard/admin`.
- `/admin/tracks`: admin track list.
- `/admin/tracks/create`: tạo track.
- `/admin/tracks/create/lessons/new`, `/admin/tracks/create/lessons/[index]`: tạo/sửa lesson trong draft.
- `/admin/tracks/[id]`: track detail/preview.
- `/admin/tracks/[id]/edit`.
- `/admin/tracks/[id]/lessons/new`, `/admin/tracks/[id]/lessons/[lessonId]/edit`.
- `/admin/tracks/[id]/exercises/new`, `/admin/tracks/[id]/exercises/[exerciseId]/edit`.
- `/admin/cohorts`, `/admin/reviews`.

## 5. Luồng data/API hiện tại

- Frontend dùng generated SDK từ `fe/src/services/client/`, export lại qua `fe/src/services/api-client.ts`.
- Base API mặc định là `https://be-teal-tau.vercel.app/api/v1`; có thể override bằng `NEXT_PUBLIC_API_URL`.
- `api-client.ts` set token vào generated client, lưu token ở `localStorage` và cookie, có retry khi 401 bằng refresh token.
- Error đi qua `error-mapper.ts`, sau đó dispatch event `api-error` để `ApiErrorProvider` hiển thị lỗi UI.
- Auth gồm hai luồng: next-auth session cho Google và custom token cho email/password. Middleware kiểm tra session hoặc cookie `auth_verified`.
- Learner course data đi qua `courseLearningApi.ts`:
  - `fetchCourses()` -> `tracksControllerFindAll`.
  - `fetchCourseDetail(courseId)` -> `tracksControllerFindOne` + `lessonsControllerFindLessons`.
  - `fetchLessonPage(courseId, lessonId)` -> course detail + lesson detail + lesson exercises.
  - `completeLesson(lessonId)` -> `lessonsControllerCompleteLesson`.
- Data API được normalize trong `fe/src/components/features/tracks/learner/utils.ts` trước khi đưa vào UI để giảm rủi ro mismatch contract.
- Admin exercise form dùng `exercisesControllerCreate`, `exercisesControllerFindOne`, `exercisesControllerUpdate`.

## 6. Component/container chính

- `fe/src/components/features/tracks/learner/TracksContainer.tsx`: load track list, handle mở track.
- `fe/src/components/features/tracks/learner/TracksTimeline.tsx`: render timeline/list learner track.
- `fe/src/components/features/tracks/learner/CourseDetailContainer.tsx`: load course detail, tính lesson để Continue.
- `fe/src/components/features/tracks/learner/CourseDetailView.tsx`: render course detail.
- `fe/src/components/features/tracks/learner/LessonDetailContainer.tsx`: load lesson page, complete lesson, tính previous/next lesson.
- `fe/src/components/features/tracks/learner/LessonDetailView.tsx`: render lesson detail.
- `fe/src/components/features/tracks/learner/CourseRoadmap.tsx`, `TrackStepCard.tsx`: roadmap/step UI.
- `fe/src/components/features/courses/CoursesContainer.tsx`: catalog/filter/pagination cho `/courses`.
- `fe/src/components/features/my-courses/MyCoursesContainer.tsx`: danh sách khóa đang học/hoàn thành.
- `fe/src/components/features/tracks/exercises/CreateExercisePage.tsx`: admin create/edit exercise.
- `fe/src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `Header.tsx`: layout chính sau login.
- `fe/src/providers/AuthProvider.tsx`: custom auth state + token flow.

## 7. Task Codex đang làm dở

Theo `CURRENT_TASK.md`, task đang được ghi là: sửa Continue navigation trong learner course/lesson flow và xử lý track summary/description bị overflow.

Trạng thái quan sát từ git log: commit gần nhất `6cafc37` ngày 2026-06-26 có message `fix flow load/error`, đã chạm các file course/lesson learner và card summary. Vì vậy task này có vẻ đã được implement/commit gần đây, nhưng tài liệu task chưa được tick hoàn tất.

Working tree hiện tại trước khi tạo file này có file chưa track:

- `PROJECT_OVERVIEW.md`
- `fe/docs/error-handling.md`

## 8. File đã sửa gần đây

Theo `git log -5`, các file đáng chú ý vừa sửa:

- `fe/src/components/features/courses/CourseCatalogCard.tsx`
- `fe/src/components/features/my-courses/MyCourseCard.tsx`
- `fe/src/components/features/tracks/learner/CourseDetailContainer.tsx`
- `fe/src/components/features/tracks/learner/CourseDetailView.tsx`
- `fe/src/components/features/tracks/learner/CourseRoadmap.tsx`
- `fe/src/components/features/tracks/learner/LessonDetailContainer.tsx`
- `fe/src/components/features/tracks/learner/LessonDetailView.tsx`
- `fe/src/components/features/tracks/learner/TrackStepCard.tsx`
- `fe/src/components/features/tracks/learner/courseLearningApi.ts`
- `fe/src/components/features/dashboard/learner/*`
- `fe/src/components/features/dashboard/admin/AdminDashboardPage.tsx`
- `fe/src/features/tracks/containers/AdminTracksContainer.tsx`
- `fe/src/features/tracks/types.ts`
- `fe/src/services/client/index.ts`
- `fe/src/types/next-auth.d.ts`

## 9. Vấn đề/rủi ro hiện tại

- `/exercises` learner page hiện chỉ render tiêu đề đơn giản, chưa có experience thật.
- Có hai route naming cùng tồn tại: `/tracks/...` và `/courses/...`. Code hiện ưu tiên điều hướng sang `/courses/...`; cần cẩn thận khi thêm link mới.
- Auth đang dual-mode: next-auth session + custom token/cookie. Cookie `auth_verified` được middleware dùng để xác định role/redirect, nên dễ có trạng thái lệch nếu token/cookie/session không đồng bộ.
- Generated API client trong `fe/src/services/client/` không nên sửa tay; nếu API đổi cần regen từ OpenAPI.
- `courseLearningApi.ts` có nhiều normalize/fallback để chống mismatch contract. Khi thêm UI mới phải kiểm tra response thật hoặc generated types.
- Một số README/tài liệu cũ bị lỗi encoding và có thể đã lỗi thời so với cấu trúc hiện tại.
- `CURRENT_TASK.md` chưa phản ánh rõ task Continue/overflow đã xong hay còn cần verify.
- Working tree có file chưa track trước tài liệu này; không nên vô tình gom vào commit nếu chỉ muốn commit context doc.

## 10. Next steps đề xuất

Đề xuất tiếp theo: làm giao diện exercise cho learner.

Hướng đi nên theo thứ tự:

1. Xác định scope của `/exercises`: danh sách exercise toàn hệ thống, exercise theo course/lesson, hay trang làm/nộp exercise.
2. Đọc API hiện có cho exercises/submissions trong generated SDK và `docs/api/openapi.json`.
3. Thiết kế flow learner exercise tối thiểu:
   - list/filter exercise;
   - exercise detail;
   - resource docs/hint/objectives/steps;
   - submission bằng GitHub PR/link nếu API đã hỗ trợ;
   - trạng thái submitted/reviewed/request changes.
4. Tạo container/view theo pattern hiện có: `page.tsx` -> Container -> View.
5. Tái dùng UI từ admin `CreateExercisePage` chỉ ở mức visual pattern, không trộn logic admin vào learner.
6. Verify responsive, loading, empty, error state và auth/API error state.
## 11. Quy ước làm việc với AI/Codex

- Không sửa generated SDK trong fe/src/services/client.
- Không trộn logic admin vào learner.
- Ưu tiên route canonical /courses thay vì /tracks.
- Mỗi task phải lập plan trước khi code.
- Nếu API chưa rõ, đọc OpenAPI/generated types trước.
- Sau khi sửa phải verify: route, loading, empty, error, responsive.