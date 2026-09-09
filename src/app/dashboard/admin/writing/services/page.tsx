import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getCreativeServices } from '@/data/mock';
import { hasAdminPermission , formatPrice } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageCatalog')) {
    return <Unauthorized />;
  }

  const services = await getCreativeServices();
  
  const formatted = services.map(s => ({
    ...s,
    priceDisplay: `${formatPrice(s.price)}`
  }));

  const columns = [
    { header: 'اسم الخدمة', accessorKey: 'name' },
    { header: 'السعر', accessorKey: 'priceDisplay' },
    { header: 'الوصف', accessorKey: 'description' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="الخدمات الإبداعية المستقلة" />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
