import { notFound } from 'next/navigation';
import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser } from '@/data/domains/auth';
import { getInstructors, getSessions } from '@/data/domains/writing';
import { hasAdminPermission, formatDate } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageInstructors')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const instructors = await getInstructors();
  const target = instructors.find(i => i.id === id);
  // مفيش سجل بالرقم ده: بنعرض صفحة «غير موجود».
  // كان مكتوب هنا «ولا هات أول واحد في القايمة» — يعني اللي بيفتح
  // رقم مش موجود كان بيشوف سجل حد تاني وهو فاكر إنه بتاعه.
  if (!target) notFound();
  
  const allBookings = await getSessions();
  const instructorBookings = allBookings.filter(b => b.instructorId === target.id);

  const formattedBookings = instructorBookings.map(b => ({
    ...b,
    idDisplay: <Link href={`/dashboard/admin/bookings/${b.id}`} className="text-blue-600 font-bold hover:underline">#{b.id.split('-')[1]}</Link>,
    dateDisplay: formatDate(b.scheduledAt),
    statusDisplay: (
      <span className={`rounded-md px-2 py-1 text-xs font-bold ${
        b.status === 'confirmed' ? 'bg-indigo-100 text-indigo-700' :
        b.status === 'completed' ? 'bg-slate-100 text-slate-700' :
        'bg-amber-100 text-amber-700'
      }`}>
        {b.status}
      </span>
    )
  }));

  const columns = [
    { header: 'رقم الحجز', accessorKey: 'idDisplay' },
    { header: 'تاريخ الجلسة', accessorKey: 'dateDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`جلسات المدرب: ${target.displayName}`} backHref={`/dashboard/admin/instructors/${target.id}`} />
      <SimpleDataTable columns={columns} data={formattedBookings} />
    </div>
  );
}
