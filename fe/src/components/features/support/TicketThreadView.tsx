'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Loader2,
  RefreshCw,
  Send,
  Edit2,
  Check,
  X,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/default/dialog';
import { type SupportTicketDto, type TicketStatus, type TicketReplyDto } from '@/mocks/support-tickets';
import {
  supportTicketsControllerFindOne,
  supportTicketsControllerAddReply,
  supportTicketsControllerUpdateReply,
  supportTicketsControllerUpdateStatus,
} from '@/services/api-client';
import { useAuth } from '@/providers/AuthProvider';

interface TicketThreadViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string | null;
  onUpdated: () => void;
}

export function TicketThreadView({ open, onOpenChange, ticketId, onUpdated }: TicketThreadViewProps) {
  const t = useTranslations('SupportPage');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [ticket, setTicket] = useState<SupportTicketDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Inline edit state for last reply
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadTicketDetail = useCallback(async (isManualRefresh = false) => {
    if (!ticketId) return;
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMsg(null);
    try {
      const res = await supportTicketsControllerFindOne({ path: { id: ticketId } });
      setTicket(res.data);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể tải hội thoại support ticket.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (open && ticketId) {
      setEditingReplyId(null);
      setReplyText('');
      loadTicketDetail();
    } else {
      setTicket(null);
    }
  }, [open, ticketId, loadTicketDetail]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !replyText.trim()) return;

    setIsSending(true);
    setErrorMsg(null);
    try {
      await supportTicketsControllerAddReply({
        path: { ticketId: ticket.id },
        body: {
          ticketId: ticket.id,
          content: replyText.trim(),
          senderId: user?.id || (isAdmin ? 'usr_001' : 'usr_002'),
          senderRole: isAdmin ? 'Admin' : 'Learner',
          senderName: user?.name || (isAdmin ? 'Nguyễn Huy' : 'Trần Lan'),
          senderAvatarInitials: user?.name ? user.name.slice(0, 2).toUpperCase() : (isAdmin ? 'NH' : 'TL'),
          senderAvatarColorHsl: isAdmin ? 'hsl(210, 70%, 50%)' : 'hsl(340, 70%, 50%)',
        },
      });
      setReplyText('');
      onUpdated();
      await loadTicketDetail(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi khi gửi phản hồi.');
    } finally {
      setIsSending(false);
    }
  };

  const handleStartInlineEdit = (reply: TicketReplyDto) => {
    setEditingReplyId(reply.id);
    setEditingContent(reply.content);
  };

  const handleSaveInlineEdit = async (replyId: string) => {
    if (!ticket || !editingContent.trim()) return;
    setIsSavingEdit(true);
    setErrorMsg(null);
    try {
      await supportTicketsControllerUpdateReply({
        path: { ticketId: ticket.id, replyId },
        body: { replyId, content: editingContent.trim() },
      });
      setEditingReplyId(null);
      onUpdated();
      await loadTicketDetail(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi khi cập nhật tin nhắn.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    setIsUpdatingStatus(true);
    try {
      await supportTicketsControllerUpdateStatus({
        path: { id: ticket.id },
        body: { status: newStatus },
      });
      onUpdated();
      await loadTicketDetail(true);
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{t('statusOpen')}</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />{t('statusInProgress')}</span>;
      case 'Resolved':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />{t('statusResolved')}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs">{status}</span>;
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('vi-VN');
    } catch {
      return isoString;
    }
  };

  // Determine if the last reply in the timeline belongs to the current user (or matching role)
  const replies = ticket?.replies || [];
  const lastReply = replies.length > 0 ? replies[replies.length - 1] : null;
  const isLastReplyMine = lastReply
    ? (lastReply.senderId === user?.id || (isAdmin && lastReply.senderRole === 'Admin') || (!isAdmin && lastReply.senderRole === 'Learner'))
    : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[92vh] flex flex-col p-0 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl text-on-surface overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-outline-variant/30 bg-surface-container-low/50">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {ticket?.ticketNumber || 'TK-...'}
                </span>
                {ticket && getStatusBadge(ticket.status)}
                {ticket?.severity === 'urgent' && (
                  <span className="px-2 py-0.5 rounded bg-error/15 text-error font-bold text-xs uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Khẩn cấp
                  </span>
                )}
              </div>
              <DialogTitle className="font-heading text-lg sm:text-xl font-bold text-on-surface leading-snug">
                {ticket?.subject || 'Đang tải thông tin ticket...'}
              </DialogTitle>
              {ticket && (
                <div className="text-xs text-on-surface-variant flex items-center gap-2 flex-wrap pt-1">
                  <span className="font-semibold text-on-surface">{ticket.learnerName}</span>
                  <span>({ticket.learnerEmail})</span>
                  <span>•</span>
                  <span>Cohort: {ticket.learnerCohort}</span>
                </div>
              )}
            </div>

            {/* Admin Quick Status Dropdown */}
            {isAdmin && ticket && (
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Trạng thái
                </label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  disabled={isUpdatingStatus}
                  className="h-9 px-2.5 rounded-lg border border-outline-variant bg-surface-container font-bold text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
                >
                  <option value="Open">Mở (Open)</option>
                  <option value="In Progress">Đang xử lý (In Progress)</option>
                  <option value="Resolved">Đã giải quyết (Resolved)</option>
                </select>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Toolbar with Manual Refresh Button */}
        <div className="px-5 sm:px-6 py-2.5 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-on-surface-variant font-medium">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Hội thoại trực tuyến ({replies.length} tin nhắn)</span>
          </div>
          <button
            type="button"
            onClick={() => loadTicketDetail(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/50 hover:bg-surface-container-high text-on-surface font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? t('refreshing') : t('refreshThreadBtn')}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 my-2 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Replies Timeline Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-surface/50 min-h-[300px] max-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-on-surface-variant font-medium">Đang tải hội thoại...</p>
            </div>
          ) : !ticket ? (
            <div className="text-center py-20 text-xs text-on-surface-variant">Không tìm thấy dữ liệu ticket.</div>
          ) : replies.length === 0 ? (
            <div className="text-center py-20 text-xs text-on-surface-variant">Chưa có tin nhắn nào trong hội thoại này.</div>
          ) : (
            replies.map((reply, idx) => {
              const isLast = idx === replies.length - 1;
              const isEditMode = editingReplyId === reply.id;
              const isSenderAdmin = reply.senderRole === 'Admin';
              const canEditThisReply = isLast && isLastReplyMine;

              return (
                <div
                  key={reply.id}
                  className={`flex gap-3.5 items-start ${isSenderAdmin ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar Initials */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm select-none"
                    style={{ backgroundColor: reply.senderAvatarColorHsl || (isSenderAdmin ? 'hsl(210, 70%, 50%)' : 'hsl(340, 70%, 50%)') }}
                  >
                    {reply.senderAvatarInitials || (isSenderAdmin ? 'NH' : 'TL')}
                  </div>

                  {/* Bubble Container */}
                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-xs space-y-2 ${
                    isSenderAdmin
                      ? 'bg-primary/10 border border-primary/25 rounded-tr-xs text-on-surface'
                      : 'bg-surface-container-low border border-outline-variant/40 rounded-tl-xs text-on-surface'
                  }`}>
                    {/* Sender Info & Header */}
                    <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
                      <div className="flex items-center gap-2 font-bold">
                        <span>{reply.senderName}</span>
                        {isSenderAdmin ? (
                          <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-bold text-[10px] uppercase flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-surface-container font-semibold text-on-surface-variant text-[10px]">
                            Learner
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-on-surface-variant/70">
                          {formatTimestamp(reply.createdAt)}
                        </span>

                        {/* Edit Button on the last message bubble if it belongs to current user */}
                        {canEditThisReply && !isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleStartInlineEdit(reply)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-[11px] border border-outline-variant/40 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-primary" />
                            <span>{t('editReplyBtn')}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content Body / Inline Edit Form */}
                    {isEditMode ? (
                      <div className="space-y-3 pt-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={3}
                          disabled={isSavingEdit}
                          className="w-full p-3 rounded-xl border border-primary bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingReplyId(null)}
                            disabled={isSavingEdit}
                            className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 inline mr-1" />
                            <span>{t('cancelEditBtn')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveInlineEdit(reply.id)}
                            disabled={isSavingEdit}
                            className="px-4 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>{t('saveReplyBtn')}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {reply.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Reply Form / Rule Notice */}
        <div className="p-4 sm:p-5 border-t border-outline-variant/30 bg-surface-container-lowest">
          {isLastReplyMine && !editingReplyId ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-700 dark:text-amber-300">
              <div className="flex items-center gap-2.5 font-medium leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span>{t('lastReplyReminder')}</span>
              </div>
              {lastReply && (
                <button
                  type="button"
                  onClick={() => handleStartInlineEdit(lastReply)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-bold text-xs whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa ngay</span>
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSendReply} className="flex items-center gap-3">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t('replyPlaceholder')}
                disabled={isSending || isLoading || !ticket || (isLastReplyMine && !editingReplyId)}
                className="flex-1 h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSending || !replyText.trim() || isLoading || !ticket || (isLastReplyMine && !editingReplyId)}
                className="h-11 px-5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('sendingReply')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('sendReplyBtn')}</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
