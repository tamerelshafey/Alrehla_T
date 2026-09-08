import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const pages = [
  { id: 'home', title: 'الصفحة الرئيسية', path: '/' },
  { id: 'about', title: 'رحلتنا (عن المنصة)', path: '/about' },
  { id: 'privacy', title: 'سياسة الخصوصية', path: '/privacy' },
  { id: 'terms', title: 'الشروط والأحكام', path: '/terms' },
];

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageContent')) {
    return <Unauthorized />;
  }

  const formatted = pages.map(p => ({
    ...p,
    titleDisplay: <span className="font-bold text-slate-800">{p.title}</span>,
    actionDisplay: <Link href="#" className="font-bold text-blue-600 hover:underline">تعديل المحتوى</Link>
  }));

  const columns = [
    { header: 'اسم الصفحة', accessorKey: 'titleDisplay' },
    { header: 'المسار', accessorKey: 'path' },
    { header: 'الإجراء', accessorKey: 'actionDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="إدارة الصفحات الثابتة" />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
