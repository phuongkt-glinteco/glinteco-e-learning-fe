# FE-3.2: Giao diện My Courses (Khóa học của tôi)

> **Bối cảnh từ repo:** Sidebar đã có menu "Khóa học của tôi" trỏ `/my-courses` nhưng route chưa tồn tại → 404. Task này bổ sung route + UI tự nhiên, không đụng gì hiện có.

## 0. Phân biệt với các trang hiện có (QUAN TRỌNG — tránh vỡ)

| Route | Vai trò | Status | Task này đụng không? |
|---|---|---|---|
| `/tracks` | Timeline lộ trình onboarding (tất cả track: completed + in_progress + locked) | Đã có, dùng `TracksContainer` | ❌ Không đụng |
| `/courses` | Alias của `/tracks` (cùng `TracksContainer`) | Đã có | ❌ Không đụng |
| `/courses/[id]`, `/courses/[id]/lessons/[id]` | Track detail + lesson detail | Đã có | ❌ Không đụng |
| `/admin/tracks` | Admin CRUD track, reorder, pagination | Đã có | ❌ Không đụng |
| **`/my-courses`** | **Mới** — chỉ track learner đang tham gia (in_progress + completed) | Chưa có | ✅ Tạo mới |

**Nguyên tắc:** Tạo page/container/view riêng. **Không rename, không sửa** `TracksContainer` hay `TracksTimeline` hay `TrackStepCard`. Reuse type + normalize function, không import component.

## 1. Mục tiêu

Learner có trang riêng để xem và tiếp tục các khóa đang học dở — tách khỏi timeline tổng thể ở `/tracks`.

## 2. Phân biệt nghiệp vụ

- **`/tracks` (Khóa học)** = Catalog đầy đủ: tất cả track theo thứ tự milestone dạng timeline, kể cả `locked`.
- **`/my-courses` (Khóa học của tôi)** = Chỉ track learner đang tham gia: `in_progress` + `completed`, **không show `locked`**. Card grid + tab filter, không phải timeline.

## 3. Data source

- `GET /api/v1/tracks` — BE đã trả `status` per-learner (`completed` / `in_progress` / `locked`), kèm `lessonsCompleted`, `lessonCount`. ✅ **Đã có, dùng tạm.**
- SDK: `getTracks()` từ `@/services/api-client`.
- FE filter `status !== 'locked'` client-side (BE trả hết, FE lọc).

| `status` | Hiển thị ở /my-courses? | Tab |
|---|---|---|
| `in_progress` | ✅ | "Đang học" (default) |
| `completed` | ✅ | "Đã hoàn thành" |
| `locked` | ❌ Ẩn | — |

## 4. Scope

### Cần làm

- [ ] Tạo `fe/src/app/(authenticated)/my-courses/page.tsx` (Server Component, chỉ render container).
- [ ] `MyCoursesContainer` ('use client') — gọi `getTracks`, filter `status !== 'locked'`, giữ state.
- [ ] `MyCoursesView` (presentational) — grid card + tab filter.
- [ ] `MyCourseCard` — card 1 track với progress bar + nút Continue/Review.
- [ ] 2 tab: "Đang học" (default, `in_progress`) / "Đã hoàn thành" (`completed`).
- [ ] Nút "Continue" trên card `in_progress` → `/courses/{trackId}/lessons/{currentLessonId}` (fallback `/courses/{trackId}`).
- [ ] Nút "Review" trên card `completed` → `/courses/{trackId}`.
- [ ] Empty state theo tab + CTA → `/tracks`.
- [ ] Loading (Skeleton) + Error (Retry).

### Không làm

- [ ] Không sửa `/tracks`, `/courses`, `TracksContainer`, `TracksTimeline`, `TrackStepCard`.
- [ ] Không đụng `/admin/tracks` (admin CRUD).
- [ ] Không rename component/entity (`Track` → `Course` chỉ là UI label).
- [ ] Không tự tính `locked` (dùng field BE).
- [ ] Không thêm endpoint mới.

## 5. Files dự kiến

```
fe/src/app/(authenticated)/my-courses/
└── page.tsx                      # Server Component, chỉ render <MyCoursesContainer />
```

```
fe/src/components/features/my-courses/
├── MyCoursesContainer.tsx         # 'use client', state + getTracks + filter
├── MyCoursesView.tsx              # presentational, grid + tab
└── MyCourseCard.tsx               # card 1 track
```

### Reuse (không tạo mới, không sửa)

- `fetchCourses()` từ `courseLearningApi.ts` (đã có `getTracks` + `normalizeTrackSummaries`).
- Type `LearnerTrack` từ `tracks/learner/types.ts`.
- Type `TrackSummary` từ SDK (`types.gen.ts:117` — đã có `status`, `lessonsCompleted`, `lessonCount`).
- Sidebar đã có link `/my-courses` → không cần sửa.

### Naming convention

- **Code entity:** giữ `Track` (vì BE là `/tracks`, SDK là `getTracks`).
- **UI text:** "Khóa học của tôi" (i18n key `myCourses` đã có trong `messages/vi.json:194`).

## 6. UI States

- [ ] Default: grid card, default tab "Đang học".
- [ ] Loading: Skeleton grid 3-4 card.
- [ ] Empty toàn bộ: "Chưa có khóa học nào" + CTA → `/tracks`.
- [ ] Empty theo tab: message phù hợp.
- [ ] Error: message + Retry.

## 7. Acceptance Criteria

```gherkin
Scenario: Learner mở My Courses
  Given Learner đã đăng nhập
  When truy cập /my-courses
  Then hiển thị grid track có status in_progress hoặc completed
  And KHÔNG hiển thị track locked
  And default tab là "Đang học"

Scenario: Chuyển tab
  Given đang ở tab "Đang học"
  When click "Đã hoàn thành"
  Then chỉ hiển thị track completed

Scenario: Continue track đang học
  Given card track in_progress
  When click "Continue"
  Then chuyển sang /courses/{trackId}/lessons/{currentLessonId} (hoặc /courses/{trackId})

Scenario: Review track đã xong
  Given card track completed
  When click "Review"
  Then chuyển sang /courses/{trackId}

Scenario: Track locked không xuất hiện
  Given Learner có track locked
  When vào /my-courses
  Then track locked KHÔNG hiển thị ở tab nào

Scenario: Empty state tab "Đang học"
  Given không có track in_progress
  When vào /my-courses
  Then thấy "Bạn chưa bắt đầu khóa nào" + CTA "Khám phá lộ trình" → /tracks
```

## 8. Manual Test

1. `pnpm dev` → login `alice@glinteco.com` / `rampup123`.
2. Click sidebar "Khóa học của tôi" → vào `/my-courses` (không 404 nữa).
3. Verify: chỉ thấy track `in_progress` + `completed`, không có `locked`.
4. Chuyển tab "Đang học" ↔ "Đã hoàn thành".
5. Click "Continue" → chuyển trang track detail.
6. Click "Review" → chuyển trang track detail.
7. Tắt BE → reload → error state + Retry.
8. Verify `/tracks` vẫn hoạt động bình thường (không vỡ).
9. `pnpm lint` + `pnpm build`.

## 9. Notes

- **Không vỡ `/tracks`**: code entity là `Track`, UI label là "Khóa học". Không rename.
- **Cùng API `/tracks`**: khác ở filter (`!== 'locked'`) + presentation (card grid thay timeline).
- **`currentLessonId`**: nếu BE trả → Continue route thẳng tới lesson; nếu không → route tới track detail.
- **Test kỹ regression**: sau khi làm, verify `/tracks`, `/courses`, `/courses/[id]`, `/courses/[id]/lessons/[id]` vẫn hoạt động.
