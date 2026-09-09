import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getPublisherPayouts, getPublishers } from '@/data/mock';
import { hasAdminPermission , formatPrice } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageFinance')) {
    return <Unauthorized />;
  }

  const payouts = await getPublisherPayouts();
  const publishers = await getPublishers();
  
  const formatted = payouts.map(p => {
    const publisher = publishers.find(pub => pub.id === p.publisherId);
    return {
      ...p,
      publisherDisplay: publisher?.name || p.publisherId,
      idDisplay: <span className="font-bold text-slate-700">#{p.id.split('-')[1]}</span>,
      amountDisplay: `${formatPrice(p.amount)}`,
      periodDisplay: p.period,
      statusDisplay: p.status === 'paid'
        ? <StatusBadge type="success" label="مدفوع" />
        : <StatusBadge type="warning" label="معلق" />
    };
  });

  const columns = [
    { header: 'الرقم', accessorKey: 'idDisplay' },
    { header: 'الناشر', accessorKey: 'publisherDisplay' },
    { header: 'الفترة', accessorKey: 'periodDisplay' },
    { header: 'المبلغ', accessorKey: 'amountDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="مستحقات الناشرين" />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
