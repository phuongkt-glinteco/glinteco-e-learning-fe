'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import {
  Plus,
  Search,
  ArrowLeft,
  Ticket,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  LifeBuoy,
} from 'lucide-react';
import { type SupportTicketDto, type TicketStatus, type CreateTicketDto } from '@/mocks/support-tickets';
import { supportTicketsControllerFindAll, supportTicketsControllerCreate } from '@/services/api-client';
import { useAuth } from '@/providers/AuthProvider';
import { CreateTicketModal } from './CreateTicketModal';
import { TicketThreadView } from './TicketThreadView';

export function SupportTicketsClient() {
  const t = useTranslations('SupportPage');
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tickets, setTickets] = useState<SupportTicketDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await supportTicketsControllerFindAll({
        query: {
          status: statusFilter === 'all' ? undefined : statusFilter,
          q: searchQuery,
          learnerId: user?.id || 'usr_002', // filter by current learner
        },
      });
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, user?.id]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Check URL query params on mount
  useEffect(() => {
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    if (action === 'create') {
      setCreateModalOpen(true);
    }
    if (id) {
      setSelectedTicketId(id);
    }
  }, [searchParams]);

  const handleSubmitTicket = async (data: CreateTicketDto) => {
    const res = await supportTicketsControllerCreate({ body: data });
    setSelectedTicketId(res.data.id);
    loadTickets();
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

  const getTopicLabel = (topic: string) => {
    switch (topic) {
      case 'setup':
        return 'Setup & Cài đặt';
      case 'doc':
        return 'Tài liệu / Bài giảng';
      case 'access':
        return 'Quyền truy cập';
      default:
        return 'Khác';
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN') + ' - ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-12 max-w-container-max mx-auto w-full space-y-8 text-on-surface animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Link href="/support" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại kho FAQ</span>
            </Link>
            <span>/</span>
            <span>Support Center</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-on-surface flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-primary" />
            <span>{t('myTicketsTitle')}</span>
          </h1>
          <p className="text-sm text-on-surface-variant">
            {t('myTicketsSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-container hover:shadow-lg transition-all flex items-center justify-center gap-2 self-start sm:self-center cursor-pointer active:scale-[0.99]"
        >
          <Plus className="w-5 h-5" />
          <span>{t('newTicketBtn')}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo mã ticket, tiêu đề hoặc nội dung..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">{t('filterAllStatus')}</option>
            <option value="Open">{t('statusOpen')}</option>
            <option value="In Progress">{t('statusInProgress')}</option>
            <option value="Resolved">{t('statusResolved')}</option>
          </select>
        </div>
      </div>

      {/* Tickets List View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
          <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-semibold text-on-surface-variant">Đang tải danh sách yêu cầu hỗ trợ...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/40">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-on-surface">{t('noTicketsFound')}</p>
            <p className="text-xs text-on-surface-variant max-w-md">{t('noTicketsDesc')}</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-sm hover:bg-primary-container transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo yêu cầu ngay</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedTicketId(item.id)}
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {item.ticketNumber}
                  </span>
                  {getStatusBadge(item.status)}
                  <span className="px-2.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-xs font-semibold">
                    {getTopicLabel(item.topic)}
                  </span>
                  {item.severity === 'urgent' && (
                    <span className="px-2 py-0.5 rounded bg-error/15 text-error font-bold text-[11px] uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Khẩn cấp
                    </span>
                  )}
                </div>

                <h3 className="font-heading text-base sm:text-lg font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                  {item.subject}
                </h3>

                {item.lastReply ? (
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-low/60 p-2.5 rounded-xl border border-outline-variant/20">
                    <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-semibold text-on-surface">{item.lastReply.senderName}:</span>
                    <span className="truncate flex-1">{item.lastReply.contentSnippet}</span>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant line-clamp-1">{item.description}</p>
                )}
              </div>

              <div className="flex sm:flex-col sm:items-end justify-between items-center gap-2 sm:gap-3 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
                <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-on-surface-variant/60" />
                  <span>Cập nhật: {formatTimestamp(item.updatedAt)}</span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTicketId(item.id);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-on-primary font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('viewThreadBtn')} ({item.replies?.length || 1})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmitted={loadTickets}
        onSubmitTicket={handleSubmitTicket}
      />

      {/* Ticket Thread View Modal */}
      <TicketThreadView
        open={!!selectedTicketId}
        onOpenChange={(open) => !open && setSelectedTicketId(null)}
        ticketId={selectedTicketId}
        onUpdated={loadTickets}
      />
    </div>
  );
}
