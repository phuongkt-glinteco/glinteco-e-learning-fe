export type TicketSeverity = 'normal' | 'urgent';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';
export type TicketTopic = 'setup' | 'doc' | 'access' | 'other';

export interface TicketReplyDto {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: 'Admin' | 'Learner';
  senderName: string;
  senderAvatarInitials: string;
  senderAvatarColorHsl: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SupportTicketDto {
  id: string;
  ticketNumber: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  learnerCohort: string;
  learnerAvatarInitials: string;
  learnerAvatarColorHsl: string;
  topic: TicketTopic;
  subject: string;
  description: string;
  severity: TicketSeverity;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  replies: TicketReplyDto[];
  lastReply?: {
    id: string;
    senderId: string;
    senderRole: 'Admin' | 'Learner';
    senderName: string;
    createdAt: string;
    contentSnippet: string;
  };
}

export interface CreateTicketDto {
  topic: TicketTopic;
  subject: string;
  description: string;
  severity: TicketSeverity;
  learnerId?: string;
  learnerName?: string;
  learnerEmail?: string;
  learnerCohort?: string;
  learnerAvatarInitials?: string;
  learnerAvatarColorHsl?: string;
}

export interface CreateReplyDto {
  ticketId: string;
  content: string;
  senderId?: string;
  senderRole?: 'Admin' | 'Learner';
  senderName?: string;
  senderAvatarInitials?: string;
  senderAvatarColorHsl?: string;
}

export interface UpdateReplyDto {
  replyId: string;
  content: string;
}

export interface UpdateTicketStatusDto {
  status: TicketStatus;
}

export const INITIAL_MOCK_TICKETS: SupportTicketDto[] = [
  {
    id: 'tkt_001',
    ticketNumber: 'TK-2026-001',
    learnerId: 'usr_002',
    learnerName: 'Trần Lan',
    learnerEmail: 'lan.tran@company.com',
    learnerCohort: 'Onboarding 2024 - Q1',
    learnerAvatarInitials: 'TL',
    learnerAvatarColorHsl: 'hsl(340, 70%, 50%)',
    topic: 'setup',
    subject: 'Lỗi không khởi động được Docker container trên port 6336 cho Frontend Next.js',
    description: 'Khi em chạy lệnh `docker-compose up -d`, container fe bị exit với mã lỗi 137. Em đã kiểm tra RAM của máy vẫn còn trống 4GB.',
    severity: 'urgent',
    status: 'In Progress',
    createdAt: '2026-07-13T09:30:00Z',
    updatedAt: '2026-07-14T10:15:00Z',
    replies: [
      {
        id: 'rep_101',
        ticketId: 'tkt_001',
        senderId: 'usr_002',
        senderRole: 'Learner',
        senderName: 'Trần Lan',
        senderAvatarInitials: 'TL',
        senderAvatarColorHsl: 'hsl(340, 70%, 50%)',
        content: 'Chào các anh/chị mentor, khi em chạy lệnh `docker-compose up -d`, container fe bị exit với mã lỗi 137. Em đã kiểm tra RAM của máy vẫn còn trống 4GB. Mong được hỗ trợ ạ.',
        createdAt: '2026-07-13T09:30:00Z'
      },
      {
        id: 'rep_102',
        ticketId: 'tkt_001',
        senderId: 'usr_001',
        senderRole: 'Admin',
        senderName: 'Nguyễn Huy',
        senderAvatarInitials: 'NH',
        senderAvatarColorHsl: 'hsl(210, 70%, 50%)',
        content: 'Chào Lan, lỗi exit code 137 trong Docker thường do Out-Of-Memory (OOM Killer). Em kiểm tra xem trong Docker Desktop Settings đã cấp tối thiểu bao nhiêu RAM cho Docker engine nhé (nên để tối thiểu 6GB).',
        createdAt: '2026-07-13T14:10:00Z'
      },
      {
        id: 'rep_103',
        ticketId: 'tkt_001',
        senderId: 'usr_002',
        senderRole: 'Learner',
        senderName: 'Trần Lan',
        senderAvatarInitials: 'TL',
        senderAvatarColorHsl: 'hsl(340, 70%, 50%)',
        content: 'Em cảm ơn anh Huy. Em đã tăng RAM trong Docker Desktop lên 8GB nhưng khi build lại thì gặp thêm cảnh báo về biến môi trường NEXT_PUBLIC_API_URL. Em gửi ảnh log đính kèm ạ.',
        createdAt: '2026-07-14T10:15:00Z'
      }
    ]
  },
  {
    id: 'tkt_002',
    ticketNumber: 'TK-2026-002',
    learnerId: 'usr_002',
    learnerName: 'Trần Lan',
    learnerEmail: 'lan.tran@company.com',
    learnerCohort: 'Onboarding 2024 - Q1',
    learnerAvatarInitials: 'TL',
    learnerAvatarColorHsl: 'hsl(340, 70%, 50%)',
    topic: 'access',
    subject: 'Xin cấp quyền truy cập vào Google Drive chứa tài liệu Architecture Decision Records (ADR)',
    description: 'Hiện tại em click vào link tài liệu ADR trong trang hướng dẫn Onboarding thì nhận báo lỗi 403 Forbidden.',
    severity: 'normal',
    status: 'Open',
    createdAt: '2026-07-14T14:00:00Z',
    updatedAt: '2026-07-14T14:00:00Z',
    replies: [
      {
        id: 'rep_201',
        ticketId: 'tkt_002',
        senderId: 'usr_002',
        senderRole: 'Learner',
        senderName: 'Trần Lan',
        senderAvatarInitials: 'TL',
        senderAvatarColorHsl: 'hsl(340, 70%, 50%)',
        content: 'Hiện tại em click vào link tài liệu ADR trong trang hướng dẫn Onboarding thì nhận báo lỗi 403 Forbidden. Em dùng email công ty lan.tran@company.com ạ.',
        createdAt: '2026-07-14T14:00:00Z'
      }
    ]
  },
  {
    id: 'tkt_003',
    ticketNumber: 'TK-2026-003',
    learnerId: 'usr_003',
    learnerName: 'Lê Văn Cường',
    learnerEmail: 'cuong.le@company.com',
    learnerCohort: 'Onboarding 2024 - Q1',
    learnerAvatarInitials: 'LC',
    learnerAvatarColorHsl: 'hsl(160, 70%, 40%)',
    topic: 'doc',
    subject: 'Góp ý sửa lỗi sai chính tả trong bài hướng dẫn Git Guardrails',
    description: 'Trong bước 3 của bài hướng dẫn Git Guardrails, lệnh `git config --global core.hooksPath` bị thiếu chữ `s` ở `hooksPath`.',
    severity: 'normal',
    status: 'Resolved',
    createdAt: '2026-07-10T11:20:00Z',
    updatedAt: '2026-07-11T16:45:00Z',
    replies: [
      {
        id: 'rep_301',
        ticketId: 'tkt_003',
        senderId: 'usr_003',
        senderRole: 'Learner',
        senderName: 'Lê Văn Cường',
        senderAvatarInitials: 'LC',
        senderAvatarColorHsl: 'hsl(160, 70%, 40%)',
        content: 'Trong bước 3 của bài hướng dẫn Git Guardrails, lệnh `git config --global core.hooksPath` bị viết thành `hookPath` dẫn đến hook không chạy.',
        createdAt: '2026-07-10T11:20:00Z'
      },
      {
        id: 'rep_302',
        ticketId: 'tkt_003',
        senderId: 'usr_001',
        senderRole: 'Admin',
        senderName: 'Nguyễn Huy',
        senderAvatarInitials: 'NH',
        senderAvatarColorHsl: 'hsl(210, 70%, 50%)',
        content: 'Cảm ơn Cường đã phát hiện! Anh đã cập nhật lại tài liệu và merge PR fix rồi nhé. Đóng ticket tại đây nha.',
        createdAt: '2026-07-11T16:45:00Z'
      }
    ]
  }
];

// Helper to compute lastReply for ticket summaries
export function formatTicketSummary(ticket: SupportTicketDto): SupportTicketDto {
  const lastReplyObj = ticket.replies && ticket.replies.length > 0
    ? ticket.replies[ticket.replies.length - 1]
    : undefined;

  return {
    ...ticket,
    lastReply: lastReplyObj ? {
      id: lastReplyObj.id,
      senderId: lastReplyObj.senderId,
      senderRole: lastReplyObj.senderRole,
      senderName: lastReplyObj.senderName,
      createdAt: lastReplyObj.createdAt,
      contentSnippet: lastReplyObj.content.length > 80
        ? lastReplyObj.content.slice(0, 80) + '...'
        : lastReplyObj.content,
    } : undefined
  };
}
