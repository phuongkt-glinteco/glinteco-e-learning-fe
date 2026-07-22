import React from 'react';
import { UserManagementClient } from '@/components/features/users/UserManagementClient';

export default function UsersPage() {
  return (
    <div className="p-gutter max-w-7xl mx-auto space-y-xl w-full flex-1">
      <UserManagementClient />
    </div>
  );
}
