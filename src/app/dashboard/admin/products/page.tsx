import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getPersonalizedProducts, getPublishers } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManagePublishers')) {
    return <Unauthorized />;
  }

  const allProducts = await getPersonalizedProducts();
  const publishers = await getPublishers();
  
  const formattedProducts = allProducts.map(p => {
    let ownerDisplay = <StatusBadge type="neutral" label="المنصة" />;
    if (p.publisherId) {
      const pub = publishers.find(pub => pub.id === p.publisherId);
      ownerDisplay = <StatusBadge type="warning" label={pub?.name || 'ناشر'} />;
    }
    
    return {
      ...p,
      nameDisplay: <Link href={`/dashboard/admin/products/${p.id}`} className="font-bold text-blue-600 hover:underline">{p.name}</Link>,
      priceDisplay: `${p.price} ج.م`,
      categoryDisplay: p.category === 'library' ? 'مكتبة' : p.category === 'custom' ? 'مخصص' : 'اشتراك',
      ownerDisplay
    };
  });

  const columns = [
    { header: 'اسم المنتج', accessorKey: 'nameDisplay' },
    { header: 'النوع', accessorKey: 'categoryDisplay' },
    { header: 'المالك', accessorKey: 'ownerDisplay' },
    { header: 'السعر', accessorKey: 'priceDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <DashboardPageHeader title="جميع المنتجات" />
        <Link href="/dashboard/admin/products/platform" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-200 mb-6">
          <LayoutDashboard className="h-4 w-4" /> عرض منتجات المنصة فقط
        </Link>
      </div>
      <SimpleDataTable columns={columns} data={formattedProducts} />
    </div>
  );
}
