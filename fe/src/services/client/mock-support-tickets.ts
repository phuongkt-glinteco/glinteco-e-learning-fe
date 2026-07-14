import { ApiError } from '../errors';
import {
  type SupportTicketDto,
  type TicketReplyDto,
  type CreateTicketDto,
  type CreateReplyDto,
  type UpdateReplyDto,
  type TicketStatus,
  INITIAL_MOCK_TICKETS,
  formatTicketSummary,
} from '@/mocks/support-tickets';

const STORAGE_KEY = 'mock_support_tickets_storage_v1';

function getStoredTickets(): SupportTicketDto[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_TICKETS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_TICKETS));
    return INITIAL_MOCK_TICKETS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_TICKETS));
    return INITIAL_MOCK_TICKETS;
  }
}

function saveStoredTickets(tickets: SupportTicketDto[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }
}

function simulateDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function supportTicketsControllerFindAll(options?: {
  query?: { status?: string; topic?: string; q?: string; learnerId?: string };
}): Promise<{ data: SupportTicketDto[]; total: number }> {
  await simulateDelay(350);
  const tickets = getStoredTickets();
  const status = options?.query?.status;
  const topic = options?.query?.topic;
  const q = options?.query?.q?.toLowerCase()?.trim();
  const learnerId = options?.query?.learnerId;

  const filtered = tickets.filter((item) => {
    if (status && status !== 'all' && item.status.toLowerCase() !== status.toLowerCase()) {
      return false;
    }
    if (topic && topic !== 'all' && item.topic !== topic) {
      return false;
    }
    if (learnerId && item.learnerId !== learnerId) {
      return false;
    }
    if (q) {
      const matchSubject = item.subject.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchNum = item.ticketNumber.toLowerCase().includes(q);
      const matchLearner = item.learnerName.toLowerCase().includes(q) || item.learnerEmail.toLowerCase().includes(q);
      return matchSubject || matchDesc || matchNum || matchLearner;
    }
    return true;
  });

  // Sort descending by updatedAt
  const sorted = [...filtered].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const summarized = sorted.map(formatTicketSummary);

  return { data: summarized, total: summarized.length };
}

export async function supportTicketsControllerFindOne(options: {
  path: { id: string };
}): Promise<{ data: SupportTicketDto }> {
  await simulateDelay(300);
  const { id } = options.path;
  const tickets = getStoredTickets();
  const found = tickets.find((t) => t.id === id || t.ticketNumber === id);

  if (!found) {
    throw new ApiError('NOT_FOUND', `Support ticket ${id} not found`, 404, `/support-tickets/${id}`);
  }

  return { data: formatTicketSummary(found) };
}

export async function supportTicketsControllerCreate(options: {
  body: CreateTicketDto;
}): Promise<{ data: SupportTicketDto }> {
  await simulateDelay(450);
  const {
    topic,
    subject,
    description,
    severity,
    learnerId = 'usr_002',
    learnerName = 'Trần Lan',
    learnerEmail = 'lan.tran@company.com',
    learnerCohort = 'Onboarding 2024 - Q1',
    learnerAvatarInitials = 'TL',
    learnerAvatarColorHsl = 'hsl(340, 70%, 50%)',
  } = options.body;

  if (!subject.trim() || !description.trim() || !topic) {
    throw new ApiError('VALIDATION_ERROR', 'Subject, description and topic are required.', 400, '/support-tickets');
  }

  const tickets = getStoredTickets();
  const now = new Date().toISOString();
  const newId = `tkt_${Date.now()}`;
  const ticketCount = tickets.length + 1;
  const ticketNumber = `TK-2026-${String(ticketCount).padStart(3, '0')}`;

  const initialReply: TicketReplyDto = {
    id: `rep_${Date.now()}`,
    ticketId: newId,
    senderId: learnerId,
    senderRole: 'Learner',
    senderName: learnerName,
    senderAvatarInitials: learnerAvatarInitials,
    senderAvatarColorHsl: learnerAvatarColorHsl,
    content: description.trim(),
    createdAt: now,
  };

  const newTicket: SupportTicketDto = {
    id: newId,
    ticketNumber,
    learnerId,
    learnerName,
    learnerEmail,
    learnerCohort,
    learnerAvatarInitials,
    learnerAvatarColorHsl,
    topic,
    subject: subject.trim(),
    description: description.trim(),
    severity: severity || 'normal',
    status: 'Open',
    createdAt: now,
    updatedAt: now,
    replies: [initialReply],
  };

  const updated = [newTicket, ...tickets];
  saveStoredTickets(updated);

  return { data: formatTicketSummary(newTicket) };
}

export async function supportTicketsControllerAddReply(options: {
  path: { ticketId: string };
  body: CreateReplyDto;
}): Promise<{ data: SupportTicketDto }> {
  await simulateDelay(400);
  const { ticketId } = options.path;
  const {
    content,
    senderId = 'usr_002',
    senderRole = 'Learner',
    senderName = 'Trần Lan',
    senderAvatarInitials = 'TL',
    senderAvatarColorHsl = 'hsl(340, 70%, 50%)',
  } = options.body;

  if (!content.trim()) {
    throw new ApiError('VALIDATION_ERROR', 'Reply content cannot be empty.', 400, `/support-tickets/${ticketId}/replies`);
  }

  const tickets = getStoredTickets();
  const index = tickets.findIndex((t) => t.id === ticketId || t.ticketNumber === ticketId);

  if (index === -1) {
    throw new ApiError('NOT_FOUND', `Support ticket ${ticketId} not found`, 404, `/support-tickets/${ticketId}/replies`);
  }

  const ticket = tickets[index];

  // Enforce consecutive message lock if user tries to bypass UI check
  const replies = ticket.replies || [];
  if (replies.length > 0) {
    const lastReply = replies[replies.length - 1];
    if (lastReply.senderId === senderId) {
      throw new ApiError(
        'CONSECUTIVE_MESSAGE_BLOCKED',
        'Bạn vừa gửi tin nhắn cuối cùng trong hội thoại. Vui lòng chỉnh sửa phản hồi đó thay vì gửi tin nhắn liên tiếp.',
        422,
        `/support-tickets/${ticketId}/replies`
      );
    }
  }

  const now = new Date().toISOString();
  const newReply: TicketReplyDto = {
    id: `rep_${Date.now()}`,
    ticketId: ticket.id,
    senderId,
    senderRole,
    senderName,
    senderAvatarInitials,
    senderAvatarColorHsl,
    content: content.trim(),
    createdAt: now,
  };

  // If Admin replies to an Open ticket, auto transition to In Progress
  let nextStatus = ticket.status;
  if (senderRole === 'Admin' && ticket.status === 'Open') {
    nextStatus = 'In Progress';
  }

  const updatedTicket: SupportTicketDto = {
    ...ticket,
    status: nextStatus,
    updatedAt: now,
    replies: [...replies, newReply],
  };

  tickets[index] = updatedTicket;
  saveStoredTickets(tickets);

  return { data: formatTicketSummary(updatedTicket) };
}

export async function supportTicketsControllerUpdateReply(options: {
  path: { ticketId: string; replyId: string };
  body: UpdateReplyDto;
}): Promise<{ data: SupportTicketDto }> {
  await simulateDelay(350);
  const { ticketId, replyId } = options.path;
  const { content } = options.body;

  if (!content.trim()) {
    throw new ApiError('VALIDATION_ERROR', 'Reply content cannot be empty.', 400, `/support-tickets/${ticketId}/replies/${replyId}`);
  }

  const tickets = getStoredTickets();
  const index = tickets.findIndex((t) => t.id === ticketId || t.ticketNumber === ticketId);

  if (index === -1) {
    throw new ApiError('NOT_FOUND', `Support ticket ${ticketId} not found`, 404, `/support-tickets/${ticketId}`);
  }

  const ticket = tickets[index];
  const replyIndex = ticket.replies.findIndex((r) => r.id === replyId);

  if (replyIndex === -1) {
    throw new ApiError('NOT_FOUND', `Reply ${replyId} not found`, 404, `/support-tickets/${ticketId}/replies/${replyId}`);
  }

  const now = new Date().toISOString();
  const updatedReplies = [...ticket.replies];
  updatedReplies[replyIndex] = {
    ...updatedReplies[replyIndex],
    content: content.trim(),
    updatedAt: now,
  };

  // Also update description if editing the initial reply (index 0)
  const updatedDescription = replyIndex === 0 ? content.trim() : ticket.description;

  const updatedTicket: SupportTicketDto = {
    ...ticket,
    description: updatedDescription,
    updatedAt: now,
    replies: updatedReplies,
  };

  tickets[index] = updatedTicket;
  saveStoredTickets(tickets);

  return { data: formatTicketSummary(updatedTicket) };
}

export async function supportTicketsControllerUpdateStatus(options: {
  path: { id: string };
  body: { status: TicketStatus };
}): Promise<{ data: SupportTicketDto }> {
  await simulateDelay(300);
  const { id } = options.path;
  const { status } = options.body;

  const tickets = getStoredTickets();
  const index = tickets.findIndex((t) => t.id === id || t.ticketNumber === id);

  if (index === -1) {
    throw new ApiError('NOT_FOUND', `Support ticket ${id} not found`, 404, `/support-tickets/${id}/status`);
  }

  const now = new Date().toISOString();
  const updatedTicket: SupportTicketDto = {
    ...tickets[index],
    status,
    updatedAt: now,
  };

  tickets[index] = updatedTicket;
  saveStoredTickets(tickets);

  return { data: formatTicketSummary(updatedTicket) };
}
