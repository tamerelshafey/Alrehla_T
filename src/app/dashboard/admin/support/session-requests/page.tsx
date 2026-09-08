import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getSupportSessionRequests } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageSupport')) {
    return <Unauthorized />;
  }

  const requests = await getSupportSessionRequests();
  
  const formatted = requests.map(r => ({
    ...r,
    idDisplay: <span className="font-bold text-slate-700">#{r.id.split('-')[1]}</span>,
    dateDisplay: new Date(r.createdAt).toLocaleDateString('ar-EG'),
    statusDisplay: (
      <StatusBadge
          type={r.status === 'scheduled' ? 'success' : r.status === 'completed' ? 'neutral' : 'warning'}
          label={r.status === 'scheduled' ? 'مجدولة' : r.status === 'completed' ? 'مكتملة' : 'قيد الانتظار'}
        />
    )
  }));

  const columns = [
    { header: 'رقم الطلب', accessorKey: 'idDisplay' },
    { header: 'الطالب', accessorKey: 'studentName' },
    { header: 'الموضوع', accessorKey: 'topic' },
    { header: 'التاريخ', accessorKey: 'dateDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="طلبات الجلسات المخصصة" />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
