import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getBookings } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageBookings')) {
    return <Unauthorized />;
  }

  const allBookings = await getBookings();
  
  // Sort by date ascending to simulate a timeline/calendar view
  const sorted = [...allBookings].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  
  const formatted = sorted.map(b => ({
    ...b,
    idDisplay: <Link href={`/dashboard/admin/bookings/${b.id}`} className="font-bold text-blue-600 hover:underline">#{b.id.split('-')[1]}</Link>,
    dateDisplay: new Date(b.scheduledAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    timeDisplay: new Date(b.scheduledAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  }));

  const columns = [
    { header: 'التاريخ', accessorKey: 'dateDisplay' },
    { header: 'الوقت', accessorKey: 'timeDisplay' },
    { header: 'رقم الحجز', accessorKey: 'idDisplay' },
    { header: 'الطالب', accessorKey: 'studentId' },
    { header: 'المدرب', accessorKey: 'instructorId' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="تقويم الحجوزات (جدول زمني)" backHref="/dashboard/admin/bookings" />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
