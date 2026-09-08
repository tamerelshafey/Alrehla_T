import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getAllSupportTickets } from '@/data/mock';
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

  const tickets = await getAllSupportTickets();
  
  const formatted = tickets.map(t => ({
    ...t,
    idDisplay: <Link href={`/dashboard/admin/support/tickets/${t.id}`} className="font-bold text-blue-600 hover:underline">#{t.id.split('-')[1]}</Link>,
    dateDisplay: new Date(t.createdAt).toLocaleDateString('ar-EG'),
    statusDisplay: (
      <StatusBadge
          type={t.status === 'open' ? 'warning' : t.status === 'answered' ? 'neutral' : 'neutral'}
          label={t.status === 'open' ? 'مفتوحة' : t.status === 'answered' ? 'مُجاب عليها' : 'مغلقة'}
        />
    )
  }));

  const columns = [
    { header: 'رقم التذكرة', accessorKey: 'idDisplay' },
    { header: 'المُرسل', accessorKey: 'senderName' },
    { header: 'الموضوع', accessorKey: 'subject' },
    { header: 'التاريخ', accessorKey: 'dateDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="تذاكر الدعم الفني" />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
