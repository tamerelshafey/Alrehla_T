import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getSessions, getParticipantName } from '@/data/mock';
import { hasAdminPermission, formatDate } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageBookings')) {
    return <Unauthorized />;
  }

  const allBookings = await getSessions();
  const allServiceOrders = await import('@/data/mock').then(m => m.getServiceOrders());
  
  const formatted = allBookings.map(b => {
    const so = allServiceOrders.find(o => o.id === b.id);
    const displayStatus = so?.status === 'awaiting_verification' ? 'awaiting_verification' : b.status;
    return {
    ...b,
    idDisplay: <Link href={`/dashboard/admin/bookings/${b.id}`} className="font-bold text-blue-600 hover:underline">#{b.id.split('-')[1]}</Link>,
    dateDisplay: formatDate(b.scheduledAt),
    statusDisplay: (
      <StatusBadge
          type={displayStatus === 'confirmed' ? 'success' : displayStatus === 'awaiting_verification' ? 'warning' : displayStatus === 'completed' ? 'neutral' : 'warning'}
          label={displayStatus === 'confirmed' ? 'مؤكد' : displayStatus === 'awaiting_verification' ? 'بانتظار تأكيد الدفع' : displayStatus === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
        />
    ),
    sessionLink: <Link href={`/dashboard/admin/sessions/${b.id}`} className="text-blue-600 font-bold hover:underline">عرض الجلسة</Link>
    };
  });

  const columns = [
    { header: 'رقم الحجز', accessorKey: 'idDisplay' },
    { header: 'الموعد', accessorKey: 'dateDisplay' },
    { header: 'الطالب', accessorKey: 'studentName' },
    { header: 'المدرب', accessorKey: 'instructorId' },
    { header: 'الحالة', accessorKey: 'statusDisplay' },
    { header: 'الجلسة', accessorKey: 'sessionLink' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <DashboardPageHeader title="إدارة الحجوزات" />
        <Link href="/dashboard/admin/bookings/calendar" className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-200 mb-6">
          عرض التقويم / مجدولة
        </Link>
      </div>
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
