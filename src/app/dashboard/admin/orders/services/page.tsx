import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser } from '@/data/domains/auth';
import { getAllServiceOrders } from '@/data/domains/services';
import { hasAdminPermission , formatPrice } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import Link from 'next/link';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageOrders')) {
    return <Unauthorized />;
  }

  const orders = await getAllServiceOrders();

  const formatted = orders.map(order => ({
    ...order,
    idDisplay: <span className="font-mono text-xs font-bold text-blue-600">#{order.id.slice(0, 8)}</span>,
    dateDisplay: formatDate(order.createdAt),
    amountDisplay: `${formatPrice(order.amount)}`,
    statusDisplay: (
      <StatusBadge 
        type={order.status === 'paid' ? 'success' : order.status === 'refunded' ? 'neutral' : 'warning'}
        label={order.status === 'paid' ? 'مدفوع' : order.status === 'refunded' ? 'مسترجع' : order.status === 'awaiting_verification' ? 'بانتظار تأكيد الدفع' : 'قيد الانتظار'}
      />
    )
  }));

  const columns = [
    { header: 'رقم الطلب', accessorKey: 'idDisplay' },
    { header: 'معرّف المشتري', accessorKey: 'buyerProfileId' },
    { header: 'الخدمة', accessorKey: 'serviceName' },
    { header: 'المدرب', accessorKey: 'instructorName' },
    { header: 'تاريخ الدفع', accessorKey: 'dateDisplay' },
    { header: 'المبلغ الإجمالي', accessorKey: 'amountDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="إدارة الطلبات" />
      <div className="mb-6 flex gap-4">
        <Link href="/dashboard/admin/orders" className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200">طلبات المتجر</Link>
        <Link href="/dashboard/admin/orders/services" className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white">طلبات الخدمات (بداية الرحلة)</Link>
      </div>
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
