# FE Need API Audit

> Mục tiêu: đối chiếu nhu cầu data của FE với API hiện có để xác định phần backend cần bổ sung cho flow Courses / Tracks / Lessons / Exercises.

## Kết luận nhanh

- API hiện tại đã có nền cho `tracks`, `lessons list`, `exercises`, `submissions`, nhưng còn thiếu các contract quan trọng để hoàn thiện flow học.
- Các blocker chính: thiếu `GET /lessons/:lessonId`, thiếu `currentLessonId` cho Continue, và contract `complete lesson` đang lệch giữa BE response và generated client.
- MVP có thể tiếp tục giữ backend namespace là `/tracks`, còn FE dùng adapter map sang concept `Course`. Chưa nên rename backend hàng loạt nếu team đang phụ thuộc `/tracks`.
- Cần tránh mix ID thật từ DB UUID với mock slug. Mock/seed nên mirror shape gần giống API thật.

## Ưu tiên xử lý

### Blocker
- **Lesson detail/body**: Add GET /lessons/:lessonId
- **Complete lesson**: Align response. BE return hiện ở [tracks.service.ts (line 726)](D:/desgin/glinteco-e-learning-fe/be/src/tracks/tracks.service.ts:726); client kỳ vọng ở [types.gen.ts (line 1562)](D:/desgin/glinteco-e-learning-fe/fe/src/services/client/types.gen.ts:1562)
- **Current lesson for dashboard Continue**: Add currentLessonId in GET /tracks or GET /me/progress

### Important
- **Course listing cơ bản**: Bổ sung fields hoặc expose DTO learner course
- **API ID thật vs mock ID**: Không mix mock after API success; seed/mock nên mirror UUID shape
- **Course detail**: Add accessStatus, lockedReason, currentLessonId, optional milestones
- **Roadmap milestones**: MVP có thể flat; lâu dài thêm milestone model
- **Lesson list**: Trả completed + type hoặc để detail endpoint xử lý
- **Lesson type**: Add type column/DTO, default reading
- **Exercises by lesson**: Add lessonId on Exercise or join table; add GET /lessons/:id/exercises
- **Exercise detail**: Extend response with lessonId
- **Related docs**: Add lesson-doc relation or include relatedDocs in lesson detail
- **Swagger response schemas**: Add ApiOkResponse({ type: ... }) DTOs

## Gap analysis chi tiết

| FE need | API hiện có chưa? | Endpoint hiện tại | Field thiếu | Mức độ | Đề xuất BE |
| --- | --- | --- | --- | --- | --- |
| Course listing cơ bản | Có | GET /tracks | thumbnail, level, currentLessonId, lockedReason | important | Bổ sung fields hoặc expose DTO learner course |
| Continue Course tới /courses/${track.id} | Có nếu API available | GET /tracks/:id | N/A | ok | Giữ id là DB UUID; FE adapter map courseId=track.id |
| API ID thật vs mock ID | Có ID thật là UUID | Entity [track.entity.ts (line 13)](D:/desgin/glinteco-e-learning-fe/be/src/database/entities/track.entity.ts:13) | Mock dùng slug | important | Không mix mock after API success; seed/mock nên mirror UUID shape |
| Course detail | Có | GET /tracks/:id | lockedReason, currentLessonId, milestone grouping | important | Add accessStatus, lockedReason, currentLessonId, optional milestones |
| Roadmap milestones | Chưa | flat lessons trong GET /tracks/:id | milestoneId/title/order | nice-to-have/important | MVP có thể flat; lâu dài thêm milestone model |
| Lesson list | Có | GET /tracks/:id/lessons | completed, body, type | important | Trả completed + type hoặc để detail endpoint xử lý |
| Lesson detail/body | Chưa | Không có GET /lessons/:id | body/content, type, completed | blocker | Add GET /lessons/:lessonId |
| Lesson type | Chưa | N/A | video/reading/quiz/coding/assignment | important | Add type column/DTO, default reading |
| Complete lesson | Có nhưng lệch contract | POST /lessons/:id/complete | BE thiếu trackId, lessonsCompleted, trackStatus so với client type | blocker | Align response. BE return hiện ở [tracks.service.ts (line 726)](D:/desgin/glinteco-e-learning-fe/be/src/tracks/tracks.service.ts:726); client kỳ vọng ở [types.gen.ts (line 1562)](D:/desgin/glinteco-e-learning-fe/fe/src/services/client/types.gen.ts:1562) |
| Current lesson for dashboard Continue | Chưa | FE tự lấy first in_progress track | currentLessonId | blocker | Add currentLessonId in GET /tracks or GET /me/progress |
| Exercises by lesson | Chưa | Có by track: GET /tracks/:id/exercises; query by track: GET /exercises?trackId= | lessonId relation | important | Add lessonId on Exercise or join table; add GET /lessons/:id/exercises |
| Exercise detail | Có | GET /exercises/:id | relation lessonId | ok/important | Extend response with lessonId |
| Submission info | Có | POST/PUT /exercises/:id/submissions, GET /submissions/mine | per-lesson grouping | ok | Use generated client after contract sync |
| Related docs | Partially | Exercise has resources; documents API exists | docs linked directly to lesson | important | Add lesson-doc relation or include relatedDocs in lesson detail |
| Swagger response schemas | Weak | docs/openapi.json mostly descriptions | response DTO schemas | important | Add ApiOkResponse({ type: ... }) DTOs |

## Checklist gửi Backend

1. Thêm endpoint `GET /lessons/:lessonId` để FE lấy lesson detail/body/content/type/completed.
2. Bổ sung `currentLessonId` trong `GET /tracks` hoặc tạo `GET /me/progress` để dashboard Continue biết route chính xác.
3. Đồng bộ response của `POST /lessons/:id/complete` với generated client type: `trackId`, `lessonsCompleted`, `trackStatus`.
4. Bổ sung `lessonId` relation cho exercise hoặc tạo endpoint `GET /lessons/:lessonId/exercises`.
5. Bổ sung các field learner-facing cho course/track: `thumbnail`, `description`, `level`, `accessStatus`, `lockedReason`, `currentLessonId`.
6. Cân nhắc milestone model lâu dài: `milestoneId`, `title`, `order`, grouping lesson theo milestone.
7. Bổ sung Swagger DTO/schema rõ ràng bằng `ApiOkResponse({ type: ... })`, tránh chỉ có description khiến generated client yếu.

## Gợi ý route/contract FE

- `/courses`: dùng `GET /tracks` hoặc adapter `getCourses()` để render catalog.
- `/courses/[courseId]`: dùng `GET /tracks/:id` và `GET /tracks/:id/lessons` để render course detail/roadmap.
- `/courses/[courseId]/lessons/[lessonId]`: cần `GET /lessons/:lessonId`, sau đó lấy exercises/docs/submission nếu có.
- Dashboard Continue: ưu tiên dùng `currentLessonId`; nếu chưa có thì fallback về `/courses/[courseId]`, không tự đoán lesson bằng mock.

## Decision đề xuất

- **MVP ít rủi ro:** giữ BE là `/tracks`, FE tạo adapter map `TrackDto -> CourseUiModel`.
- **Lâu dài chuẩn hơn:** thống nhất domain model `Course -> Track/Roadmap -> Milestone -> Lesson -> Exercise`, rồi đổi API naming khi team sẵn sàng migration.
- **Không sửa tay file generated client** trong `fe/src/services/client/*.gen.ts`; hãy cập nhật Swagger/DTO ở BE rồi regenerate client.
