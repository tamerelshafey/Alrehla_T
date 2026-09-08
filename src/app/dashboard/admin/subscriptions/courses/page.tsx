import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getBookings } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageSubscriptions')) {
    return <Unauthorized />;
  }

  // Reuse bookings as a proxy for course subscriptions for now
  const allBookings = await getBookings();
  
  const formatted = allBookings.map(b => ({
    ...b,
    idDisplay: <span className="font-bold text-slate-700">#{b.id.split('-')[1]}</span>,
    dateDisplay: new Date(b.scheduledAt).toLocaleDateString('ar-EG'),
    statusDisplay: (
      <StatusBadge
          type={b.status === 'confirmed' ? 'success' : b.status === 'completed' ? 'neutral' : 'warning'}
          label={b.status === 'confirmed' ? 'مؤكد' : b.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
        />
    )
  }));

  const columns = [
    { header: 'رقم الاشتراك', accessorKey: 'idDisplay' },
    { header: 'الطالب', accessorKey: 'studentId' },
    { header: 'المدرب المرتبط', accessorKey: 'instructorId' },
    { header: 'تاريخ البدء', accessorKey: 'dateDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="اشتراكات الدورات متعددة الجلسات" />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
