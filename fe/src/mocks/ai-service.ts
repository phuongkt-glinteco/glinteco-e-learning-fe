import type { LessonPuckData } from '@/components/puck-editor';

export interface AiGenerateLessonParams {
  title: string;
  description: string;
  estimatedTime?: string;
  type?: string;
}

export interface AiGenerateExerciseParams {
  title: string;
  tag: string;
  difficulty: string;
  brief?: string;
}

export async function mockAiGenerateLesson(params: AiGenerateLessonParams): Promise<LessonPuckData> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { title, description } = params;

  const content = [
    {
      type: 'HeadingBlock',
      props: {
        id: 'ai-heading-1',
        title: `Giới thiệu về ${title}`,
        level: 'h2',
        align: 'left',
      },
    },
    {
      type: 'ParagraphBlock',
      props: {
        id: 'ai-paragraph-1',
        content: description || `${title} là một chủ đề quan trọng trong lập trình. Bài học này sẽ giúp bạn hiểu rõ các khái niệm cơ bản và ứng dụng thực tế.`,
        align: 'left',
        fontSize: 'base',
      },
    },
    {
      type: 'HeadingBlock',
      props: {
        id: 'ai-heading-2',
        title: 'Nội dung chính',
        level: 'h2',
        align: 'left',
      },
    },
    {
      type: 'ListBlock',
      props: {
        id: 'ai-list-1',
        items: ['Khái niệm cơ bản', 'Cách triển khai', 'Ví dụ minh họa', 'Bài tập thực hành'],
        listType: 'ul',
      },
    },
    {
      type: 'HeadingBlock',
      props: {
        id: 'ai-heading-3',
        title: 'Ví dụ chi tiết',
        level: 'h3',
        align: 'left',
      },
    },
    {
      type: 'CodeBlock',
      props: {
        id: 'ai-code-1',
        code: '// Ví dụ code mẫu\nfunction example() {\n  console.log("Hello, " + title);\n  return 42;\n}\n\nexample();',
        language: 'javascript',
      },
    },
    {
      type: 'CalloutBlock',
      props: {
        id: 'ai-callout-1',
        content: 'Mẹo: Hãy thực hành ngay sau khi học xong lý thuyết để ghi nhớ lâu hơn.',
        type: 'info',
      },
    },
  ];

  return {
    content,
    root: {
      props: {
        title,
        description: description || '',
        estimatedTime: params.estimatedTime || '30 min',
        order: 1,
        type: params.type || 'reading',
        documents: [],
        exercises: [],
      },
    },
    zones: {
      'header-zone': [
        {
          type: 'LessonHeaderBlock',
          props: {
            id: 'lesson-header-ai',
            title,
            description: description || '',
            estimatedTime: params.estimatedTime || '30 min',
            order: 1,
            type: params.type || 'reading',
          },
        },
      ],
      'root:header-zone': [
        {
          type: 'LessonHeaderBlock',
          props: {
            id: 'lesson-header-ai',
            title,
            description: description || '',
            estimatedTime: params.estimatedTime || '30 min',
            order: 1,
            type: params.type || 'reading',
          },
        },
      ],
      'sidebar-zone': [
        {
          type: 'LessonRightSidebarBlock',
          props: {
            id: 'lesson-sidebar-ai',
            showToLearner: true,
            maxHeadingLevel: 3,
            documents: [],
            exercises: [],
          },
        },
      ],
      'root:sidebar-zone': [
        {
          type: 'LessonRightSidebarBlock',
          props: {
            id: 'lesson-sidebar-ai',
            showToLearner: true,
            maxHeadingLevel: 3,
            documents: [],
            exercises: [],
          },
        },
      ],
    },
  } as any;
}

export interface AiExerciseResponse {
  title: string;
  tag: string;
  difficulty: string;
  estimatedTime: string;
  xp: number;
  brief: string;
  overview: string;
  objectives: string[];
  steps: string[];
  hint: string;
}

export async function mockAiGenerateExercise(params: AiGenerateExerciseParams): Promise<AiExerciseResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const { title, difficulty } = params;

  const xpMap = { Beginner: 50, Intermediate: 100, Advanced: 200 };
  const timeMap = { Beginner: '15 mins', Intermediate: '30 mins', Advanced: '45 mins' };

  return {
    title,
    tag: params.tag,
    difficulty,
    estimatedTime: timeMap[difficulty as keyof typeof timeMap] || '20 mins',
    xp: xpMap[difficulty as keyof typeof xpMap] || 50,
    brief: `Bài tập về ${title.toLowerCase()} giúp củng cố kiến thức và rèn luyện kỹ năng thực hành.`,
    overview: `Trong bài tập này, bạn sẽ được tìm hiểu và thực hành về ${title.toLowerCase()}. Bài tập bao gồm các khái niệm quan trọng và bài tập áp dụng thực tế.`,
    objectives: [
      `Hiểu được khái niệm cơ bản về ${title.toLowerCase()}`,
      'Áp dụng kiến thức vào giải quyết vấn đề thực tế',
      'Rèn luyện kỹ năng phân tích và debug',
    ],
    steps: [
      'Đọc kỹ yêu cầu bài tập',
      'Phân tích và lập kế hoạch giải quyết',
      'Viết code / trả lời câu hỏi',
      'Kiểm tra lại kết quả và nộp bài',
    ],
    hint: `Gợi ý: Hãy bắt đầu với các khái niệm cơ bản của ${title.toLowerCase()} trước khi làm bài tập nâng cao.`,
  };
}
