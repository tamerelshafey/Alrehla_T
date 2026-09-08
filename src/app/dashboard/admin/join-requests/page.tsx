import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getJoinRequests } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageSupport')) {
    return <Unauthorized />;
  }

  const requests = await getJoinRequests();
  
  const formatted = requests.map(r => ({
    ...r,
    nameDisplay: <Link href={`/dashboard/admin/join-requests/${r.id}`} className="font-bold text-blue-600 hover:underline">{r.applicantName}</Link>,
    roleDisplay: r.requestedRole === 'instructor' ? 'مدرب' : 'ناشر',
    dateDisplay: new Date(r.createdAt).toLocaleDateString('ar-EG'),
    statusDisplay: (
      <StatusBadge
          type={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}
          label={r.status === 'approved' ? 'مقبول' : r.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
        />
    )
  }));

  const columns = [
    { header: 'الاسم', accessorKey: 'nameDisplay' },
    { header: 'الدور المطلوب', accessorKey: 'roleDisplay' },
    { header: 'تاريخ التقديم', accessorKey: 'dateDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="طلبات الانضمام (مدربين/ناشرين)" />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
