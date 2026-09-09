import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getWritingPackages } from '@/data/mock';
import { hasAdminPermission , formatPrice } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageCatalog')) {
    return <Unauthorized />;
  }

  const packages = await getWritingPackages();
  
  const formatted = packages.map(p => ({
    ...p,
    nameDisplay: <Link href={`/dashboard/admin/writing/packages/${p.id}`} className="font-bold text-blue-600 hover:underline">{p.name}</Link>,
    priceDisplay: `${formatPrice(p.price)}`,
    sessionsDisplay: `${p.sessionsCount} جلسات`,
    statusDisplay: p.isActive 
      ? <StatusBadge type="success" label="نشط" />
      : <StatusBadge type="neutral" label="غير نشط" />
  }));

  const columns = [
    { header: 'اسم الباقة', accessorKey: 'nameDisplay' },
    { header: 'عدد الجلسات', accessorKey: 'sessionsDisplay' },
    { header: 'السعر', accessorKey: 'priceDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="باقات الكتابة الإبداعية" />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
