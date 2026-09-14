import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getAllUsers, getCurrentUser } from '@/data/domains/auth';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { isAdminApiConfigured } from '@/lib/supabase/admin';
import { UsersClient } from './UsersClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageUsers')) {
    return <Unauthorized />;
  }

  const allUsers = await getAllUsers();
  const canInvite = isAdminApiConfigured();

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
      <DashboardPageHeader title="إدارة المستخدمين والعائلات" />
      {!canInvite && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
          دعوة المستخدمين غير مفعّلة: متغير{' '}
          <code dir="ltr">SUPABASE_SERVICE_ROLE_KEY</code> غير موجود على الخادم.
        </div>
      )}
      <UsersClient
        users={allUsers}
        canInvite={canInvite}
        isSuperAdmin={user.role === 'super_admin'}
        currentUserId={user.id}
      />
    </div>
  );
}
