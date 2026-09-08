import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getPersonalizedProducts } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManagePublishers')) {
    return <Unauthorized />;
  }

  const allProducts = await getPersonalizedProducts();
  const platformProducts = allProducts.filter(p => !p.publisherId);
  
  const formattedProducts = platformProducts.map(p => ({
    ...p,
    nameDisplay: <Link href={`/dashboard/admin/products/${p.id}`} className="font-bold text-blue-600 hover:underline">{p.name}</Link>,
    priceDisplay: `${p.price} ج.م`,
    categoryDisplay: p.category === 'library' ? 'مكتبة' : p.category === 'custom' ? 'مخصص' : 'اشتراك',
    ownerDisplay: <StatusBadge type="neutral" label="المنصة" />
  }));

  const columns = [
    { header: 'اسم المنتج', accessorKey: 'nameDisplay' },
    { header: 'النوع', accessorKey: 'categoryDisplay' },
    { header: 'المالك', accessorKey: 'ownerDisplay' },
    { header: 'السعر', accessorKey: 'priceDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="منتجات المنصة" backHref="/dashboard/admin/products" />
      <SimpleDataTable columns={columns} data={formattedProducts} />
    </div>
  );
}
