# FE Need API Audit

> Cập nhật ngày 26/06/2026. Chỉ giữ các mục còn cần xử lý/verify.

## Còn cần làm

### FE cleanup

- Thay raw `client.get` trong `courseLearningApi.ts` bằng SDK function đã generate:
  - `lessonsControllerFindOneLesson` / alias `getLessonsById`.
  - `lessonsControllerFindExercisesByLesson` / alias `getLessonsByIdExercises`.
- Thêm alias dễ đọc trong `fe/src/services/client/index.ts` nếu cần.
- Khi `GET /lessons/{id}/exercises` ổn định, bỏ fallback `getExercises({ trackId })`.

### Cần verify với BE/runtime

- `POST /lessons/{id}/complete` trả đúng field FE cần: `xpAwarded`, `lessonsCompleted`, `trackStatus`, `totalXp`, `unlockedTrackId`.
- `GET /tracks` trả `currentLessonId` đúng cho Dashboard Continue Learning.
- Exercise response có `lessonId` để filter theo lesson.
- Track response có đủ field learner-facing: `thumbnail`, `level`, `accessStatus`, `lockedReason`.
- Swagger response schema đủ rõ để generated type không còn field dạng `{ [key: string]: unknown }`.

## Trạng thái

- Không còn blocker lớn.
- Các mục trên là cleanup và xác nhận contract, không chặn flow chính hiện tại.
- Không sửa tay file generated trong `fe/src/services/client/*.gen.ts`; nếu spec đổi thì regenerate SDK.
