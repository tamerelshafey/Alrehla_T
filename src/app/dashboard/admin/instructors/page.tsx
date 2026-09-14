import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser } from '@/data/domains/auth';
import { getInstructorsForAdmin } from '@/data/domains/writing';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { isAdminApiConfigured } from '@/lib/supabase/admin';
import { InstructorsClient } from './InstructorsClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageInstructors')) {
    return <Unauthorized />;
  }

  const instructors = await getInstructorsForAdmin();

  // زرار «إضافة مدرب» بيتخفي لو مفتاح الخدمة مش متظبط على الخادم — أحسن من
  // زرار بيرمي خطأ لما تدوسه.
  const canCreate = isAdminApiConfigured();

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
      <DashboardPageHeader title="إدارة المدربين" />
      {!canCreate && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
          إضافة المدربين غير مفعّلة: متغير <code dir="ltr">SUPABASE_SERVICE_ROLE_KEY</code>{' '}
          غير موجود على الخادم.
        </div>
      )}
      <InstructorsClient instructors={instructors} canCreate={canCreate} />
    </div>
  );
}
