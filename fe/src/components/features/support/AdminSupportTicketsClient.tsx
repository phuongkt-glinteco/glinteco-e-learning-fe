'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Search,
  ArrowLeft,
  Ticket,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  User,
  Filter,
} from 'lucide-react';
import { type SupportTicketDto, type TicketStatus } from '@/mocks/support-tickets';
import { supportTicketsControllerFindAll, supportTicketsControllerUpdateStatus } from '@/services/api-client';
import { TicketThreadView } from './TicketThreadView';

export function AdminSupportTicketsClient() {
  const t = useTranslations('SupportPage');

  const [tickets, setTickets] = useState<SupportTicketDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');

  // Modal state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadAllTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await supportTicketsControllerFindAll({
        query: {
          status: statusFilter === 'all' ? undefined : statusFilter,
          topic: topicFilter === 'all' ? undefined : topicFilter,
          q: searchQuery,
        },
      });
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to load admin support tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, topicFilter, searchQuery]);

  useEffect(() => {
    loadAllTickets();
  }, [loadAllTickets]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleQuickStatusChange = async (ticketId: string, newStatus: TicketStatus, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    try {
      await supportTicketsControllerUpdateStatus({
        path: { id: ticketId },
        body: { status: newStatus },
      });
      showToast(t('statusUpdatedToast'));
      loadAllTickets();
    } catch (err: any) {
      alert(err?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const getTopicBadge = (topic: string) => {
    switch (topic) {
      case 'setup':
        return <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">Setup</span>;
      case 'doc':
        return <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs">Tài liệu</span>;
      case 'access':
        return <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">Phân quyền</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-bold text-xs">Khác</span>;
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

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-8 text-on-surface animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Link href="/support" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang FAQ chính</span>
            </Link>
            <span>/</span>
            <span>Admin Control Panel</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-on-surface flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <span>{t('adminTicketsTitle')}</span>
          </h1>
          <p className="text-sm text-on-surface-variant">
            {t('adminTicketsSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={loadAllTickets}
          className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 self-start sm:self-center cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-4 h-4 text-primary" />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('filterByLearner')}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-on-surface-variant/70" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">{t('filterAllStatus')}</option>
              <option value="Open">Mở (Open)</option>
              <option value="In Progress">Đang xử lý (In Progress)</option>
              <option value="Resolved">Đã giải quyết (Resolved)</option>
            </select>
          </div>

          {/* Topic Filter */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">Tất cả chủ đề</option>
            <option value="setup">Setup & Cài đặt</option>
            <option value="doc">Tài liệu & Bài giảng</option>
            <option value="access">Quyền truy cập</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>

      {/* Admin Tickets Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
          <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-semibold text-on-surface-variant">Đang tải danh sách ticket toàn hệ thống...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-center space-y-3">
          <Ticket className="w-10 h-10 text-on-surface-variant/40" />
          <p className="text-base font-bold text-on-surface">Không tìm thấy yêu cầu hỗ trợ nào</p>
          <p className="text-xs text-on-surface-variant max-w-sm">
            Thử điều chỉnh bộ lọc trạng thái, chủ đề hoặc từ khóa tìm kiếm phía trên.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-32">Mã Ticket</th>
                  <th className="py-3.5 px-5">Học viên</th>
                  <th className="py-3.5 px-5">Chủ đề / Yêu cầu</th>
                  <th className="py-3.5 px-4 text-center">Ưu tiên</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Cập nhật cuối</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {tickets.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedTicketId(item.id)}
                    className="hover:bg-surface-container/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-primary text-xs">
                      {item.ticketNumber}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-xs"
                          style={{ backgroundColor: item.learnerAvatarColorHsl || 'hsl(340, 70%, 50%)' }}
                        >
                          {item.learnerAvatarInitials || 'TL'}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface leading-tight">{item.learnerName}</div>
                          <div className="text-[11px] text-on-surface-variant/80 leading-tight">{item.learnerEmail}</div>
                          <div className="text-[10px] text-primary/80 font-semibold pt-0.5">{item.learnerCohort}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 space-y-1.5 max-w-md">
                      <div className="flex items-center gap-2">
                        {getTopicBadge(item.topic)}
                        <span className="font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {item.subject}
                        </span>
                      </div>
                      {item.lastReply ? (
                        <div className="text-xs text-on-surface-variant italic line-clamp-1 bg-surface-container-low/60 p-1.5 rounded-lg border border-outline-variant/20">
                          <span className="font-semibold">{item.lastReply.senderName}:</span> {item.lastReply.contentSnippet}
                        </div>
                      ) : (
                        <div className="text-xs text-on-surface-variant line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {item.severity === 'urgent' ? (
                        <span className="px-2 py-1 rounded bg-error/15 text-error font-bold text-[10px] uppercase inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Khẩn cấp
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-on-surface-variant">Bình thường</span>
                      )}
                    </td>
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.status}
                        onChange={(e) => handleQuickStatusChange(item.id, e.target.value as TicketStatus, e)}
                        className={`h-8 px-2.5 rounded-lg border font-bold text-xs cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          item.status === 'Open'
                            ? 'bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400'
                            : item.status === 'In Progress'
                            ? 'bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-400'
                            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <option value="Open" className="bg-surface-container text-on-surface">Mở (Open)</option>
                        <option value="In Progress" className="bg-surface-container text-on-surface">Đang xử lý (In Progress)</option>
                        <option value="Resolved" className="bg-surface-container text-on-surface">Đã giải quyết (Resolved)</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-on-surface-variant/80 whitespace-nowrap">
                      {formatTimestamp(item.updatedAt)}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicketId(item.id);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-on-primary font-bold text-xs transition-all inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Xem hội thoại ({item.replies?.length || 1})</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Thread View Modal */}
      <TicketThreadView
        open={!!selectedTicketId}
        onOpenChange={(open) => !open && setSelectedTicketId(null)}
        ticketId={selectedTicketId}
        onUpdated={loadAllTickets}
      />

      {/* Toast */}
      <div
        className={`fixed bottom-8 right-8 bg-inverse-surface dark:bg-surface-container-highest text-inverse-on-surface dark:text-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 z-50 border border-outline-variant/20 ${
          toastMsg ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95 pointer-events-none'
        }`}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <p className="font-label-md text-sm font-bold">{toastMsg}</p>
      </div>
    </div>
  );
}
