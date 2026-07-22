import type { LessonPuckData } from '@/components/puck-editor';

export interface AiGenerateLessonParams {
  title: string;
  description: string;
  estimatedTime?: string;
  type?: string;
  intent?: string;
}

export interface AiGenerateExerciseParams {
  title: string;
  tag: string;
  difficulty: string;
  brief?: string;
}

export async function mockAiGenerateLesson(params: AiGenerateLessonParams): Promise<LessonPuckData> {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const { title, description, intent, type = 'reading' } = params;
  const displayTitle = title.trim() || intent || 'Bài học tự động';
  const displayDesc = description.trim() || intent || `${displayTitle} là một chủ đề quan trọng giúp bạn nắm vững kiến thức chuyên sâu và kỹ năng thực chiến.`;

  let content: Record<string, unknown>[] = [];

  if (type === 'practice' || type === 'coding') {
    content = [
      {
        type: 'CalloutBlock',
        props: {
          id: 'ai-callout-prereq',
          variant: 'importance',
          title: '⚠️ Kiến thức & Công cụ chuẩn bị',
          content: `- Đã cài đặt Node.js v20+ / Môi trường phát triển chuẩn\n- Nắm vững kiến thức nền tảng trước khi thực hành\n- Ý đồ bài tập: ${intent || displayTitle}`,
        },
      },
      {
        type: 'HeadingBlock',
        props: {
          id: 'ai-heading-step1',
          title: 'Bước 1: Khởi tạo và Cấu hình môi trường',
          level: 'h2',
          align: 'left',
        },
      },
      {
        type: 'ParagraphBlock',
        props: {
          id: 'ai-para-step1',
          content: 'Trước tiên, chúng ta cần thiết lập cấu trúc project và cài đặt các thư viện cần thiết để thực thi bài thực hành.',
          align: 'left',
          fontSize: 'base',
        },
      },
      {
        type: 'CodeBlock',
        props: {
          id: 'ai-code-bash',
          code: `# Thiết lập nhanh bằng terminal\nmkdir ${displayTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}\ncd ${displayTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}\nnpm init -y\nnpm install @types/node typescript --save-dev`,
          language: 'bash',
        },
      },
      {
        type: 'HeadingBlock',
        props: {
          id: 'ai-heading-step2',
          title: 'Bước 2: Triển khai Logic cốt lõi',
          level: 'h2',
          align: 'left',
        },
      },
      {
        type: 'ParagraphBlock',
        props: {
          id: 'ai-para-step2',
          content: `Tạo file xử lý chính và thực hiện mã hóa theo đúng mục tiêu: ${intent || displayTitle}. Hãy chú ý xử lý lỗi một cách triệt để.`,
          align: 'left',
          fontSize: 'base',
        },
      },
      {
        type: 'CodeBlock',
        props: {
          id: 'ai-code-ts',
          code: `/**\n * Triển khai logic thực hành: ${displayTitle}\n */\nexport async function executePracticeWorkflow(input: string) {\n  console.log("Bắt đầu xử lý với dữ liệu:", input);\n  // TODO: Viết logic xử lý chính tại đây theo yêu cầu bài thực hành\n  const result = { status: "success", timestamp: new Date().toISOString() };\n  return result;\n}`,
          language: 'typescript',
        },
      },
      {
        type: 'CalloutBlock',
        props: {
          id: 'ai-callout-challenge',
          variant: 'challenge',
          title: '⚡ Thử thách nâng cao cho bạn',
          content: 'Hãy thử bổ sung xử lý ngoại lệ (try/catch) và viết thêm đơn vị kiểm thử (Unit Test) cho hàm trên để đảm bảo tính kiên cố.',
        },
      },
    ];
  } else if (type === 'quiz') {
    content = [
      {
        type: 'CalloutBlock',
        props: {
          id: 'ai-callout-quiz-obj',
          variant: 'objective',
          title: '🎯 Mục tiêu bài kiểm tra nhanh',
          content: `Kiểm tra mức độ thấu hiểu và khả năng nhận diện tình huống thực tế xoay quanh chủ đề: ${displayTitle}.`,
        },
      },
      {
        type: 'HeadingBlock',
        props: {
          id: 'ai-heading-quiz1',
          title: 'Tình huống 1: Phân tích quyết định kỹ thuật',
          level: 'h2',
          align: 'left',
        },
      },
      {
        type: 'ParagraphBlock',
        props: {
          id: 'ai-para-quiz1',
          content: `Khi áp dụng ${displayTitle} vào một hệ thống yêu cầu độ khả dụng cao (High Availability), điều gì là quan trọng nhất cần cân nhắc?`,
          align: 'left',
          fontSize: 'base',
        },
      },
      {
        type: 'CalloutBlock',
        props: {
          id: 'ai-callout-quiz1-options',
          variant: 'info',
          title: '❓ Các phương án lựa chọn & Gợi ý suy luận',
          content: `A. Tối ưu hóa dung lượng bộ nhớ tối đa mà không quan tâm đến tính rõ ràng của code.\nB. Đảm bảo tính ổn định, cơ chế phục hồi lỗi tự động (Error Recovery) và khả năng mở rộng.\nC. Chỉ sử dụng các thư viện cũ để tránh rủi ro cập nhật.\n\n👉 Gợi ý: Hãy tập trung vào yếu tố bền vững và khả năng bảo trì dài hạn của hệ thống.`,
        },
      },
      {
        type: 'CalloutBlock',
        props: {
          id: 'ai-callout-quiz1-ans',
          variant: 'challenge',
          title: '💡 Đáp án giải thích rõ ràng',
          content: `Đáp án đúng là B. Trong môi trường Production thực tế, độ tin cậy và khả năng tự phục hồi khi có sự cố luôn được ưu tiên hàng đầu.`,
        },
      },
    ];
  } else if (type === 'hybrid') {
    content = [
      {
        type: 'CalloutBlock',
        props: {
          id: 'ai-callout-hybrid-obj',
          variant: 'objective',
          title: '🎯 Mục tiêu toàn diện của bài học',
          content: `- Nắm vững lý thuyết cốt lõi về ${displayTitle}\n- Thực hành trực tiếp qua mã lệnh minh họa\n- Tự kiểm chứng kiến thức qua câu hỏi phản biện`,
        },
      },
      {
        type: 'HeadingBlock',
        props: {
          id: 'ai-heading-hybrid-theory',
          title: '1. Lý thuyết và Nguyên lý hoạt động',
          level: 'h2',
          align: 'left',
        },
      },
      {
        type: 'ParagraphBlock',
        props: {
          id: 'ai-para-hybrid-theory',
          content: displayDesc,
          align: 'left',
          fontSize: 'base',
        },
      },
      {
        type: 'ListBlock',
        props: {
          id: 'ai-list-hybrid',
          items: [
            'Nguyên lý kiến trúc và luồng dữ liệu chính',
            'Các pattern thường gặp trong dự án thực tế',
            'Lỗi thường gặp và cách phòng tránh hiệu quả',
          ],
          listType: 'ul',
        },
      },
      {
        type: 'TableBlock',
        props: {
          id: 'ai-table-hybrid',
          headers: [
            { text: 'Tiêu chí' },
            { text: 'Cách tiếp cận truyền thống' },
            { text: `Ứng dụng ${displayTitle}` },
          ],
          rows: [
            {
              cells: [
                { text: 'Hiệu năng' },
                { text: 'Trung bình, cần tối ưu thủ công' },
                { text: 'Tối ưu vượt trội tự động' },
              ],
            },
            {
              cells: [
                { text: 'Độ bảo trì' },
                { text: 'Phức tạp khi quy mô mở rộng' },
                { text: 'Dễ bảo trì, phân chia rõ ràng' },
              ],
            },
          ],
        },
      },
      {
        type: 'HeadingBlock',
        props: {
          id: 'ai-heading-hybrid-code',
          title: '2. Mã nguồn triển khai mẫu',
          level: 'h2',
          align: 'left',
        },
      },
      {
        type: 'CodeBlock',
        props: {
          id: 'ai-code-hybrid',
          code: `// Minh họa: ${displayTitle}\nfunction runDemonstration() {\n  console.log("Thực thi bài học tổng hợp:", "${displayTitle}");\n  return true;\n}\n\nrunDemonstration();`,
          language: 'javascript',
        },
      },
      {
        type: 'CalloutBlock',
        props: {
          id: 'ai-callout-hybrid-summary',
          variant: 'info',
          title: '💡 Tổng kết & Bước tiếp theo',
          content: 'Bạn đã hoàn thành bài học tổng hợp! Hãy áp dụng ngay vào bài tập hoặc dự án thực tế để củng cố kỹ năng.',
        },
      },
    ];
  } else {
    // Default / reading
    content = [
      {
        type: 'CalloutBlock',
        props: {
          id: 'ai-callout-reading-obj',
          variant: 'objective',
          title: `🎯 Mục tiêu bài học: ${displayTitle}`,
          content: `- Hiểu tường tận khái niệm và bối cảnh ứng dụng của ${displayTitle}\n- Phân tích ưu nhược điểm trong thực tế\n- Nắm vững kiến thức chuyên sâu để chuẩn bị cho phần thực hành`,
        },
      },
      {
        type: 'HeadingBlock',
        props: {
          id: 'ai-heading-reading-1',
          title: 'Khái niệm và Tầm quan trọng',
          level: 'h2',
          align: 'left',
        },
      },
      {
        type: 'ParagraphBlock',
        props: {
          id: 'ai-para-reading-1',
          content: displayDesc,
          align: 'left',
          fontSize: 'base',
        },
      },
      {
        type: 'HeadingBlock',
        props: {
          id: 'ai-heading-reading-2',
          title: 'Các đặc điểm then chốt',
          level: 'h2',
          align: 'left',
        },
      },
      {
        type: 'ListBlock',
        props: {
          id: 'ai-list-reading-1',
          items: [
            'Tính linh hoạt cao, dễ dàng tích hợp vào hệ thống hiện có',
            'Tối ưu hóa hiệu suất xử lý và tiết kiệm tài nguyên',
            'Cộng đồng hỗ trợ mạnh mẽ cùng tiêu chuẩn bảo mật cao',
          ],
          listType: 'ul',
        },
      },
      {
        type: 'HeadingBlock',
        props: {
          id: 'ai-heading-reading-3',
          title: 'Ví dụ minh họa cách hoạt động',
          level: 'h3',
          align: 'left',
        },
      },
      {
        type: 'CodeBlock',
        props: {
          id: 'ai-code-reading-1',
          code: `/**\n * Ví dụ lý thuyết minh họa: ${displayTitle}\n */\nconst lessonMetadata = {\n  topic: "${displayTitle}",\n  level: "Comprehensive",\n  timestamp: new Date().toISOString()\n};\nconsole.log("Đang nghiên cứu:", lessonMetadata);`,
          language: 'typescript',
        },
      },
      {
        type: 'TableBlock',
        props: {
          id: 'ai-table-reading-1',
          headers: [
            { text: 'Đặc tính' },
            { text: 'Mô tả chi tiết' },
            { text: 'Mức độ áp dụng' },
          ],
          rows: [
            {
              cells: [
                { text: 'Tính đóng gói' },
                { text: 'Đảm bảo logic độc lập, không ảnh hưởng bên ngoài' },
                { text: 'Cao' },
              ],
            },
            {
              cells: [
                { text: 'Khả năng tái sử dụng' },
                { text: 'Dễ dàng tích hợp ở nhiều module khác nhau' },
                { text: 'Rất cao' },
              ],
            },
          ],
        },
      },
      {
        type: 'CalloutBlock',
        props: {
          id: 'ai-callout-reading-summary',
          variant: 'info',
          title: '💡 Ghi chú quan trọng',
          content: 'Hãy đọc kỹ từng phần lý thuyết và ghi chép lại các từ khóa chính. Bạn sẽ gặp lại chúng trong các bài tập thực hành kế tiếp.',
        },
      },
    ];
  }

  return {
    content,
    root: {
      props: {
        title: displayTitle,
        description: displayDesc,
        estimatedTime: params.estimatedTime || '20 mins',
        order: 1,
        type: type,
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
            title: displayTitle,
            description: displayDesc,
            estimatedTime: params.estimatedTime || '20 mins',
            order: 1,
            type: type,
          },
        },
      ],
      'root:header-zone': [
        {
          type: 'LessonHeaderBlock',
          props: {
            id: 'lesson-header-ai',
            title: displayTitle,
            description: displayDesc,
            estimatedTime: params.estimatedTime || '20 mins',
            order: 1,
            type: type,
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
  } as unknown as LessonPuckData;
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
