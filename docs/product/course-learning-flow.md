# Course / Learning Track Flow

## Current screenshots

- `screenshots/course-roadmap-current.png`
  - Current page shows one learning roadmap.
  - It may actually be course detail / track roadmap, not courses listing.

- `screenshots/course-locked-error-current.png`
  - Error shown after clicking locked/unavailable course.
  - Current message is "Course not available".
  - This should be split into:
    - Course not found
    - Milestone locked
    - Lesson not found
    - No lessons yet

## Expected structure

/courses
- Show many courses.

/courses/[courseId]
- Show course detail and roadmap.

/courses/[courseId]/lessons/[lessonId]
- Show lesson content and exercises.

## Data source expectation

For now FE can use mock data.
Later replace mock data with API/database response.

UI must be data-driven, not hardcoded.