import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getSubscriptionTiers } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageSubscriptions')) {
    return <Unauthorized />;
  }

  const plans = await getSubscriptionTiers();
  
  const formatted = plans.map(p => ({
    ...p,
    priceMonthlyDisplay: `${p.priceMonthly} ج.م / شهر`,
    priceTotalDisplay: `${p.priceTotal} ج.م الإجمالي`,
    durationDisplay: `${p.durationMonths} أشهر`
  }));

  const columns = [
    { header: 'اسم الخطة', accessorKey: 'name' },
    { header: 'المدة', accessorKey: 'durationDisplay' },
    { header: 'الاشتراك الشهري', accessorKey: 'priceMonthlyDisplay' },
    { header: 'التكلفة الإجمالية', accessorKey: 'priceTotalDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="خطط صندوق الرحلة" backHref="/dashboard/admin/subscriptions/box" />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
