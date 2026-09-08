import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getInstructorPayouts, getInstructors } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { AdminPayoutClient } from './AdminPayoutClient';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageFinance')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const payouts = await getInstructorPayouts();
  const target = payouts.find(p => p.id === id) || payouts[0];
  
  const instructors = await getInstructors();
  const instructor = instructors.find(i => i.id === target.instructorId);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`مراجعة الدفعة #${target.id.split('-')[1]}`} backHref="/dashboard/admin/finance/instructor-payouts" />
      <AdminPayoutClient payout={target} instructor={instructor} />
    </div>
  );
}
