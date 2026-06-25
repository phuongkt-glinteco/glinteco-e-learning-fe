# FE-2.3: Giao diện Courses của Learner

> **Bối cảnh từ repo:** Hiện `/tracks` và `/courses` đang dùng chung `TracksContainer` (timeline stepper tuyến tính). Task này tạo riêng `/courses` thành trang catalog có filter/search/sort/pagination, **không đụng** `/tracks` (timeline onboarding giữ nguyên).

## 0. Phân biệt với các trang hiện có (QUAN TRỌNG — tránh vỡ)

| Route | Vai trò | Status | Task này đụng không? |
|---|---|---|---|
| `/tracks` | Timeline lộ trình onboarding (stepper dọc) | Đã có, `TracksContainer` | ❌ Không đụng |
| `/courses` | **Catalog khóa học** (grid + filter/search/sort/pagination) | Đang là alias `/tracks` | ✅ Tách thành trang riêng |
| `/courses/[id]` | Track detail | Đã có | ❌ Không đụng |
| `/courses/[id]/lessons/[id]` | Lesson detail | Đã có | ❌ Không đụng |
| `/my-courses` | Track đang học dở (in_progress + completed) | Task FE-3.2 | ❌ Không đụng |
| `/admin/tracks` | Admin CRUD track | Đã có | ❌ Không đụng |

**Nguyên tắc:** Tách `/courses` ra khỏi `TracksContainer`. **Không sửa** `TracksContainer`, `TracksTimeline`, `TrackStepCard`. Tạo container/view riêng cho catalog.

## 1. Mục tiêu

Learner có trang catalog khóa học dạng grid, với filter (theo trạng thái mở/khóa), search (theo tên), sort (theo order/tên/progress), và phân trang — thay vì timeline tuyến tính.

## 2. Phân biệt nghiệp vụ

- **`/tracks`** = Timeline onboarding tuyến tính (stepper dọc, mục đích theo dõi lộ trình).
- **`/courses` (task này)** = Catalog grid (mục đích duyệt/tìm kiếm khóa học).
- **`/my-courses` (task FE-3.2)** = Chỉ khóa đang học dở + đã xong, không có locked.

Cả 3 dùng chung API `GET /tracks` nhưng khác presentation + filter.

## 3. Data source

- `GET /api/v1/tracks` — BE trả danh sách track, mỗi track kèm `status` per-learner (`completed` / `in_progress` / `locked`).
- SDK: `getTracks()` từ `@/services/api-client`.
- **Không thêm endpoint mới.**

### Hiển thị khác nhau giữa track mở và chưa mở

| `status` | Visual card | Clickable? |
|---|---|---|
| `completed` | Badge xanh "Đã hoàn thành" + progress 100% | ✅ Click → `/courses/{id}` |
| `in_progress` | Badge primary "Đang học" + progress bar | ✅ Click → `/courses/{id}` |
| `locked` | Badge xám "Chưa mở" + icon lock + lý do (nếu BE trả `lockedReason`) | ❌ Không click, hiển thị mờ |

## 4. Scope

### Cần làm

- [ ] Tách route `/courses` ra khỏi `TracksContainer` — tạo `CoursesContainer` riêng.
- [ ] `CoursesContainer` ('use client') — gọi `getTracks`, giữ state data/loading/error + state filter/search/sort/page.
- [ ] `CoursesView` (presentational) — render header + toolbar + grid card + pagination.
- [ ] `CourseCatalogCard` — card 1 track với badge trạng thái + progress + nút mở.
- [ ] **Filter**: dropdown/tab theo trạng thái — "Tất cả" (default) / "Đang học" / "Đã hoàn thành" / "Chưa mở".
- [ ] **Search**: input text, filter client-side theo `title` + `description`.
- [ ] **Sort**: dropdown — "Thứ tự lộ trình" (default, theo `order`) / "Tên A-Z" / "Tiến độ cao nhất".
- [ ] **Phân trang**: client-side pagination (vd: 8-12 card/page), có nút Previous/Next + số trang.
- [ ] Empty state: "Không tìm thấy khóa học" + gợi ý xóa filter.
- [ ] Loading (Skeleton grid) + Error (Retry).

### Không làm

- [ ] Không sửa `/tracks` (timeline giữ nguyên).
- [ ] Không sửa `/courses/[id]`, `/courses/[id]/lessons/[id]`.
- [ ] Không đụng `/admin/tracks`, `/my-courses`.
- [ ] Không rename entity (`Track` → `Course` chỉ là UI label).
- [ ] Không thêm endpoint mới (filter/search/sort/pagination làm client-side, BE chưa hỗ trợ query).
- [ ] Không làm search server-side (deferred — đợi BE có `?q=` query param).

## 5. Files dự kiến

```
fe/src/app/(authenticated)/courses/
└── page.tsx                      # Server Component, render <CoursesContainer /> (thay vì TracksContainer)
```

```
fe/src/components/features/courses/
├── CoursesContainer.tsx           # 'use client', state + getTracks + filter/search/sort/paginate
├── CoursesView.tsx                # presentational, toolbar + grid + pagination
├── CourseCatalogCard.tsx          # card 1 track
└── types.ts                       # Re-use LearnerTrack, thêm type cho filter/sort
```

### Reuse (không tạo mới, không sửa)

- `fetchCourses()` từ `courseLearningApi.ts` (đã có `getTracks` + `normalizeTrackSummaries`).
- Type `LearnerTrack` từ `tracks/learner/types.ts`.
- `Skeleton`, `StatusBadge` từ `components/ui/`.

### Naming convention

- **Code entity:** giữ `Track` (BE là `/tracks`, SDK là `getTracks`).
- **UI text:** "Khóa học" (i18n key `courses` đã có `messages/vi.json:193`).

## 6. UI States

- [ ] Default: grid card, filter "Tất cả", sort "Thứ tự lộ trình", page 1.
- [ ] Loading: Skeleton grid 8-12 card.
- [ ] Empty (không có track): "Chưa có khóa học nào".
- [ ] Empty (filter không khớp): "Không tìm thấy khóa học" + nút "Xóa bộ lọc".
- [ ] Error: message + Retry.

## 7. Acceptance Criteria

```gherkin
Scenario: Learner mở trang Courses
  Given Learner đã đăng nhập
  When truy cập /courses
  Then hiển thị grid card tất cả track
  And mỗi card hiển thị: tên, mô tả rút gọn, thời gian, số bài học, progress %, badge trạng thái
  And card locked hiển thị mờ + icon lock, không click được
  And card completed/in_progress có nút "Mở" / "Tiếp tục"

Scenario: Filter theo trạng thái
  Given Learner đang ở /courses
  When chọn filter "Đang học"
  Then chỉ hiển thị track có status = in_progress

Scenario: Search theo tên
  Given Learner đang ở /courses
  When gõ "NestJS" vào ô search
  Then chỉ hiển thị track có title/description chứa "NestJS"
  And nếu không có kết quả → empty state "Không tìm thấy khóa học"

Scenario: Sort
  Given Learner đang ở /courses
  When chọn sort "Tên A-Z"
  Then card sắp xếp theo title alphabet

Scenario: Phân trang
  Given catalog có >12 track
  When ở page 1
  Then thấy nút "Next" + số trang
  When click "Next"
  Then chuyển sang page 2, hiển thị card tiếp theo

Scenario: Click vào card mở khóa
  Given card track có status = completed hoặc in_progress
  When click nút "Mở" / "Tiếp tục"
  Then chuyển sang /courses/{trackId}

Scenario: Card locked không click
  Given card track có status = locked
  Then card hiển thị mờ + không có nút click
  And nếu BE trả lockedReason → hiển thị text lý do

Scenario: /tracks vẫn hoạt động
  Given task đã hoàn thành
  When truy cập /tracks
  Then timeline stepper vẫn hoạt động bình thường (không vỡ)
```

## 8. Manual Test

1. `pnpm dev` → login `alice@glinteco.com` / `rampup123`.
2. Vào `/courses` → thấy grid card (không phải timeline).
3. Verify card `locked` hiển thị mờ, không click.
4. Verify card `completed` / `in_progress` click được → chuyển trang.
5. Chọn filter "Đang học" → chỉ hiện track in_progress.
6. Gõ search "NestJS" → filter theo tên.
7. Đổi sort "Tên A-Z" → card sắp xếp lại.
8. Nếu >12 track → test nút Next/Previous.
9. Xóa hết filter/search → về default.
10. Tắt BE → reload → error state + Retry.
11. **Regression:** vào `/tracks` → vẫn thấy timeline (không vỡ).
12. **Regression:** vào `/courses/[id]` → vẫn vào track detail.
13. `pnpm lint` + `pnpm build`.

## 9. Notes

- **Tách `TracksContainer`:** hiện `/courses/page.tsx` đang `import TracksContainer` → đổi thành `import CoursesContainer`. **Không sửa** `TracksContainer.tsx` (vẫn dùng cho `/tracks`).
- **Filter/search/sort/pagination client-side:** vì BE chưa có query param cho các field này. Nếu sau này BE hỗ trợ `?status=&q=&sort=&page=&limit=` → chuyển sang server-side.
- **`lockedReason`:** nếu BE trả field này → hiển thị trên card locked; nếu không → text mặc định "Hoàn thành track trước để mở khóa".
- **Pagination size:** đề xuất 12 card/page (3 cột × 4 dòng ở desktop). Configurable qua constant.
- **Test kỹ regression:** `/tracks`, `/courses/[id]`, `/courses/[id]/lessons/[id]`, `/my-courses` (sau khi FE-3.2 xong) vẫn hoạt động.
