export type FaqCategory = 'setup' | 'git' | 'grading' | 'account' | 'other';

export interface LocalizedString {
  vi: string;
  en: string;
}

export interface FaqDto {
  id: string;
  category: FaqCategory;
  titleKey?: string;
  contentKey?: string;
  question: LocalizedString;
  answer: LocalizedString;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export interface FaqCreateDto {
  category: FaqCategory;
  questionVi: string;
  questionEn: string;
  answerVi: string;
  answerEn: string;
  order?: number;
}

export interface FaqUpdateDto {
  category?: FaqCategory;
  questionVi?: string;
  questionEn?: string;
  answerVi?: string;
  answerEn?: string;
  order?: number;
}

export const INITIAL_MOCK_FAQS: FaqDto[] = [
  {
    id: 'faq-1',
    category: 'setup',
    titleKey: 'faq1Title',
    contentKey: 'faq1Content',
    question: {
      vi: 'Làm thế nào để khởi tạo và chạy dự án Frontend & Backend ở máy Local?',
      en: 'How do I initialize and run the frontend & backend locally?'
    },
    answer: {
      vi: 'Đảm bảo bạn đã cài đặt Node.js v20+ và Docker. Với Frontend, chạy lệnh `npm install` rồi chạy `npm run dev` để mở server Next.js tại port 6336. Với Backend, hãy copy file `.env.example` thành `.env`, kiểm tra cấu hình database và khởi chạy container bằng lệnh `docker-compose up -d`.',
      en: 'Make sure you have Node.js v20+ and Docker installed. For the frontend, run `npm install` followed by `npm run dev` to start the Next.js server on port 6336. For the backend, ensure your `.env` variables match `.env.example` and start the database containers using `docker-compose up -d`.'
    },
    order: 1,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'faq-2',
    category: 'account',
    titleKey: 'faq2Title',
    contentKey: 'faq2Content',
    question: {
      vi: 'Tại sao tôi bị lỗi 401 Unauthorized hoặc bị đá ra khi đăng nhập bằng tài khoản Learner?',
      en: 'Why am I getting a 401 Unauthorized error when logging in as a Learner?'
    },
    answer: {
      vi: 'Nếu bạn đang test các tính năng quản trị (Admin Dashboard), hãy đảm bảo tài khoản trong database của bạn được cấp quyền Admin hoặc Instructor. Bạn có thể chạy lệnh `npm run seed:users` ở bên repository backend để reset lại tài khoản test với đầy đủ quyền hạn.',
      en: 'If you are testing admin features, make sure your user account has the required Admin or Instructor role assigned in the database. You can run the local seeding script `npm run seed:users` in the backend repository to reset test accounts with proper role assignments.'
    },
    order: 2,
    createdAt: '2026-01-11T09:15:00Z'
  },
  {
    id: 'faq-3',
    category: 'git',
    titleKey: 'faq3Title',
    contentKey: 'faq3Content',
    question: {
      vi: 'Luồng Git chuẩn (Git workflow) khi tạo Pull Request trong dự án là gì?',
      en: 'What is the standard Git workflow for submitting a Pull Request?'
    },
    answer: {
      vi: 'Luôn tạo nhánh mới từ nhánh `main` theo quy tắc đặt tên: `feature/tên-tính-năng` hoặc `fix/mô-tả-lỗi`. Đảm bảo đã chạy kiểm tra `npm run lint` và sửa hết lỗi lint trước khi push. Khi tạo PR, hãy tag ít nhất 1 kỹ sư trong nhóm hoặc mentor của bạn để review code.',
      en: 'Always branch off from `main` using the naming convention `feature/your-feature-name` or `fix/issue-description`. Ensure all ESLint checks (`npm run lint`) pass locally before pushing. Submit your PR and request a review from at least one engineering peer or mentor.'
    },
    order: 3,
    createdAt: '2026-01-12T10:30:00Z'
  },
  {
    id: 'faq-4',
    category: 'grading',
    titleKey: 'faq4Title',
    contentKey: 'faq4Content',
    question: {
      vi: 'Hệ thống tự động chấm điểm và đánh giá bài tập code hoạt động như thế nào?',
      en: 'How does the automated exercise evaluation and grading system work?'
    },
    answer: {
      vi: 'Khi học viên nộp bài giải, mã nguồn sẽ được gửi đến môi trường test cô lập (Docker runner hoặc AI eval engine). Kết quả chấm và số điểm XP sẽ được tính toán bất đồng bộ. Để test luồng chấm điểm ở local, bạn có thể gọi API mock hoặc sử dụng endpoint `/api/v1/exercises/submit`.',
      en: 'When a learner submits an exercise solution, the code is sent to an isolated Docker test runner or AI evaluation engine. Results and XP awards are calculated asynchronously. As an engineer, you can test grading logic locally by using the mock endpoints in `/api/v1/exercises/submit`.'
    },
    order: 4,
    createdAt: '2026-01-13T11:00:00Z'
  },
  {
    id: 'faq-5',
    category: 'account',
    titleKey: 'faq5Title',
    contentKey: 'faq5Content',
    question: {
      vi: 'Làm sao để yêu cầu cấp thêm quyền truy cập tài liệu nội bộ hoặc kho lưu trữ?',
      en: 'How do I request additional permissions or access to internal docs?'
    },
    answer: {
      vi: 'Quyền truy cập Google Drive, GitHub Teams và các hệ thống Staging được quản lý theo nhóm Google Workspace. Nếu bạn gặp lỗi 403 Forbidden khi xem tài liệu, vui lòng gửi yêu cầu qua form hỗ trợ này hoặc nhắn tin cho mentor phụ trách onboarding của bạn.',
      en: 'Access to internal Google Drive folders, GitHub team repos, and staging environments is managed via Google Workspace groups. If you lack permissions to view a document or repository, please submit a request via this support form or ping your assigned onboarding mentor on Slack.'
    },
    order: 5,
    createdAt: '2026-01-14T14:20:00Z'
  }
];
