import React, { Suspense } from 'react';
import { AdminSupportTicketsClient } from '@/components/features/support/AdminSupportTicketsClient';

export default function AdminSupportTicketsPage() {
  return (
    <div className="p-gutter max-w-7xl mx-auto space-y-xl w-full flex-1">
      <Suspense fallback={<div className="py-20 text-center text-sm font-semibold">Đang tải bảng quản trị ticket...</div>}>
        <AdminSupportTicketsClient />
      </Suspense>
    </div>
  );
}
