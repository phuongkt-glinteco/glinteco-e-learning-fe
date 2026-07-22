import React, { Suspense } from 'react';
import { SupportTicketsClient } from '@/components/features/support/SupportTicketsClient';

export default function SupportTicketsPage() {
  return (
    <div className="p-gutter max-w-7xl mx-auto space-y-xl w-full flex-1">
      <Suspense fallback={<div className="py-20 text-center text-sm font-semibold">Đang tải trung tâm hỗ trợ...</div>}>
        <SupportTicketsClient />
      </Suspense>
    </div>
  );
}
