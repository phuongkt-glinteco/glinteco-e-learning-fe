# FE Need API Audit (cập nhật 25/06/2026)

> Đối chiếu nhu cầu FE với 3 nguồn API spec:
> - **FE source gen**: `fe/docs/docs.json` (dùng cho `pnpm gen:api`)
> - **Repo spec**: `docs/api/openapi.json`
> - **Remote BE**: `https://be-teal-tau.vercel.app/api/v1/docs-json`
>
> File này thay thế `FE_need_API_audit.md` bản 24/06.

## Kết luận nhanh

1. **Backend đã fix 2 blocker lớn** của bản audit trước (`GET /lessons/{id}`, `GET /lessons/{id}/exercises`) — nhưng **FE chưa regenerate SDK** nên vẫn đang dùng raw `client.get` workaround.
2. **`fe/docs/docs.json` đang cũ** — thiếu 3 endpoint so với remote BE.
3. Còn 1 blocker chưa verify được qua spec (cần test thực tế): response của `POST /lessons/{id}/complete` có align với FE type không.
4. Các placeholder page (Exercises, Leaderboard, Settings, Admin Cohorts/Reviews) — API đã có sẵn trong SDK, chỉ thiếu UI.

---

## 1. So sánh 3 nguồn API spec (lesson/exercise/submission)

| Endpoint | FE source gen (`fe/docs/docs.json`) | Repo spec (`docs/api/openapi.json`) | Remote BE (production) | SDK FE có function? |
|---|---|---|---|---|
| `GET /tracks/{id}/lessons` | ✅ | ✅ | ✅ | ✅ `getTracksByIdLessons` |
| `GET /lessons/{id}` | ✅ | ✅ | ✅ | ✅ `getLessonsById` *(chưa dùng, FE vẫn raw)* |
| `PATCH /lessons/{id}` | ✅ | ✅ | ✅ | ✅ `patchLessonsById` |
| `DELETE /lessons/{id}` | ✅ | ✅ | ✅ | ✅ `deleteLessonsById` |
| `POST /lessons/{id}/complete` | ✅ | ✅ | ✅ | ✅ `postLessonsByIdComplete` |
| **`GET /lessons/{id}/exercises`** | ❌ **THIẾU** | ✅ | ✅ | ❌ **chưa gen** — FE dùng raw `client.get` + fallback |
| **`GET /tracks/{id}/exercises`** | ❌ **THIẾU** | ✅ | ✅ | ❌ **chưa gen** |
| `GET /exercises` | ✅ | ✅ | ✅ | ✅ `getExercises` |
| `GET /exercises/{id}` | ✅ | ✅ | ✅ | ✅ `getExercisesById` |
| `POST /exercises/{id}/submissions` | ✅ | ✅ | ✅ | ✅ `postExercisesByIdSubmissions` |
| `PUT /exercises/{id}/submissions` | ✅ | ✅ | ✅ | ✅ `putExercisesByIdSubmissions` |
| `GET /submissions` | ✅ | ✅ | ✅ | ✅ `getSubmissions` |
| `GET /submissions/mine` | ✅ | ✅ | ✅ | ✅ `getSubmissionsMine` |
| `GET /submissions/{id}` | ✅ | ✅ | ✅ | ✅ `getSubmissionsById` |
| `POST /submissions/{id}/approve` | ✅ | ✅ | ✅ | ✅ `postSubmissionsByIdApprove` |
| `POST /submissions/{id}/request-changes` | ✅ | ✅ | ✅ | ✅ `postSubmissionsByIdRequestChanges` |
| `GET /submissions/{id}/history` | ✅ | ✅ | ✅ | ✅ `getSubmissionsByIdHistory` |
| **`POST /submissions/{id}/review`** | ❌ **THIẾU** | ✅ | ✅ | ❌ **chưa gen** |

### Đánh giá

- **BE không thiếu endpoint nào** trong nhóm lesson/exercise/submission.
- **Vấn đề là FE chưa regen SDK** từ remote. Chạy:
  ```bash
  pnpm gen:api:remote
  ```
  Sau đó thay 2 chỗ raw `client.get` trong `courseLearningApi.ts:96,115` bằng SDK function mới (`getLessonsById`, `getLessonsByIdExercises`).

---

## 2. Trạng thái các gap của bản audit cũ (24/06)

| Gap cũ | Mức độ cũ | Status hiện tại | Bằng chứng |
|---|---|---|---|
| Thêm `GET /lessons/{id}` (lesson detail/body) | Blocker | ✅ **RESOLVED** — BE đã có | Remote BE có path `/api/v1/lessons/{id}` GET |
| `currentLessonId` trong `GET /tracks` cho Dashboard Continue | Blocker | ⚠️ **Cần verify** | Spec parse không rõ, FE vẫn fallback `first in_progress track` (`ContinueLearningSection.tsx:37-38`). Cần test response thực tế. |
| Align response `POST /lessons/{id}/complete` với FE type | Blocker | ⚠️ **Cần verify** | FE type kỳ vọng `{ xpAwarded, lessonsCompleted, trackStatus, totalXp, unlockedTrackId }` (`courseLearningApi.ts:51-59`). BE spec không parse được schema qua PowerShell. **Cần BE confirm hoặc test POST thực tế.** |
| `GET /lessons/{id}/exercises` | Important | ✅ **RESOLVED ở BE** — nhưng FE chưa regen | Remote BE có path; FE dùng raw client + fallback |
| `lessonId` relation trên Exercise | Important | ⚠️ **Cần verify** | FE fallback filter `exercise.lessonId === lessonId` (`courseLearningApi.ts:134-138`) — nếu BE chưa trả `lessonId` thì filter trả toàn bộ track exercises |
| Bổ sung fields learner-facing cho track: `thumbnail`, `level`, `accessStatus`, `lockedReason`, `currentLessonId` | Important | ⚠️ **Cần verify** | FE có normalize fallback cho tất cả field này (`utils.ts:122-142`), không crash nếu thiếu, nhưng UI hiển thị default value |
| `lesson.type` (video/reading/quiz/coding/assignment) | Important | ⚠️ **Cần verify** | FE default `'reading'` nếu thiếu (`utils.ts:21,118-120`) |
| Swagger DTO schema rõ ràng (`ApiOkResponse({ type })`) | Important | ❌ **Vẫn yếu** | PowerShell không parse được `responses."200".content` → spec thiếu schema chi tiết, chỉ có description. Generated client type yếu. |
| Milestone model (grouping lesson) | Nice-to-have | ⏳ Deferred | Ngoài scope MVP |

---

## 3. Endpoint FE cần nhưng BE chưa có

Sau khi rà soát toàn bộ code FE (page, container, feature component), **không phát hiện endpoint nào FE gọi mà BE thiếu**. Các placeholder page (Exercises, Leaderboard, Settings, Admin Cohorts/Reviews) đều đã có API tương ứng trong SDK.

| FE screen (placeholder) | API cần | SDK có sẵn? |
|---|---|---|
| Exercises list `/exercises` | `GET /exercises` | ✅ `getExercises` |
| Leaderboard `/leaderboard` | `GET /leaderboard` | ✅ `getLeaderboard` |
| Settings `/settings` | `PATCH /users/me` | ✅ `patchUsersMe` |
| Admin Cohorts `/admin/cohorts` | `GET/POST /cohorts`, `PATCH /cohorts/{id}` | ✅ |
| Admin Reviews `/admin/reviews` | `GET /submissions?status=submitted`, `POST /submissions/{id}/approve`, `POST /submissions/{id}/request-changes` | ✅ |

---

## 4. Checklist gửi Backend

### BE cần làm (ưu tiên cao → thấp)

1. **Verify response `POST /lessons/{id}/complete`** trả đủ các field FE kỳ vọng:
   - `xpAwarded` (number)
   - `lessonsCompleted` (number)
   - `trackStatus` (`'completed' | 'in_progress' | 'locked'`)
   - `totalXp` (number, optional)
   - `unlockedTrackId` (string | null, optional)
   - Nếu BE trả field khác tên → align hoặc FE sẽ fallback default (`DEFAULT_LESSON_XP = 40`).

2. **Verify `GET /tracks` trả `currentLessonId`** cho từng track (để Dashboard Continue Learning route chính xác). Hiện FE fallback "first incomplete lesson".

3. **Verify `GET /exercises` (và `/exercises/{id}`) trả `lessonId`** — để FE filter exercise theo lesson. Nếu không có, FE show toàn bộ track exercises cho mọi lesson.

4. **Verify các learner-facing field trên track**: `thumbnail`, `level`, `accessStatus`, `lockedReason`. FE có fallback nhưng UI sẽ default nếu thiếu.

5. **Verify `GET /tracks/{id}/lessons` và `GET /lessons/{id}` trả `type`** (lesson type). FE default `'reading'`.

6. **Bổ sung Swagger response schema** rõ ràng bằng `@ApiOkResponse({ type: TrackDetailDto })` (không chỉ description). Hiện generated client type yếu — nhiều field `optional` dù BE luôn trả.

7. **Confirm endpoint `POST /submissions/{id}/review`** dùng làm gì (BE có nhưng FE chưa dùng). Có thể là approve+request-changes gộp? FE đang dùng 2 endpoint riêng `approve` + `request-changes`.

### FE cần làm (sau khi BE confirm)

1. **Chạy `pnpm gen:api:remote`** để regenerate SDK từ BE production (lấy 3 endpoint mới: `/lessons/{id}/exercises`, `/tracks/{id}/exercises`, `/submissions/{id}/review`).

2. **Thay raw `client.get` trong `courseLearningApi.ts:96,115`** bằng SDK function `getLessonsById` + `getLessonsByIdExercises` sau khi regen.

3. **Bỏ fallback `getExercises?trackId=` filter** trong `fetchLessonExercises` (`courseLearningApi.ts:127-138`) sau khi `GET /lessons/{id}/exercises` hoạt động ổn định.

4. **Cập nhật `fe/docs/docs.json`** từ remote (hoặc xóa file này và luôn gen từ remote để tránh stale).

---

## 5. Ghi chú kỹ thuật

- **Không sửa tay** `fe/src/services/client/*.gen.ts` — luôn regenerate.
- **3 nguồn spec nên đồng bộ**: đề xuất BE là source of truth, FE chạy `gen:api:remote` định kỳ. File `fe/docs/docs.json` chỉ dùng khi offline/dev local.
- **Contract mismatch defense**: FE có lớp `normalize*` trong `components/features/tracks/learner/utils.ts` — adapter này chống crash khi BE trả field thiếu/khác type, nhưng che giấu gap. Khi BE đủ field, nên giản dần normalize layer.
