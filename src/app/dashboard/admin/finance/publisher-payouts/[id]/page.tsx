import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getPublishers, getPublisherPayouts } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { AdminPublisherPayoutClient } from './AdminPublisherPayoutClient';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageFinance')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const payouts = await getPublisherPayouts();
  const target = payouts.find(p => p.id === id) || payouts[0];
  
  const publishers = await getPublishers();
  const publisher = publishers.find(p => p.id === target.publisherId);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`مراجعة مستحقات الناشر #${target.id.split('-')[1] || target.id}`} backHref="/dashboard/admin/finance/publisher-payouts" />
      <AdminPublisherPayoutClient payout={target} publisher={publisher} />
    </div>
  );
}
