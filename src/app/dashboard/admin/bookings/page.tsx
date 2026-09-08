import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getBookings } from '@/data/mock';
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

  const allBookings = await getBookings();
  
  const formatted = allBookings.map(b => ({
    ...b,
    idDisplay: <Link href={`/dashboard/admin/bookings/${b.id}`} className="font-bold text-blue-600 hover:underline">#{b.id.split('-')[1]}</Link>,
    dateDisplay: formatDate(b.scheduledAt),
    statusDisplay: (
      <StatusBadge
          type={b.status === 'confirmed' ? 'success' : b.status === 'completed' ? 'neutral' : 'warning'}
          label={b.status === 'confirmed' ? 'مؤكد' : b.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
        />
    ),
    sessionLink: <Link href={`/dashboard/admin/sessions/${b.id}`} className="text-blue-600 font-bold hover:underline">عرض الجلسة</Link>
  }));

  const columns = [
    { header: 'رقم الحجز', accessorKey: 'idDisplay' },
    { header: 'الموعد', accessorKey: 'dateDisplay' },
    { header: 'الطالب', accessorKey: 'studentId' },
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
