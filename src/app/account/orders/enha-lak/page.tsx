import { formatPrice } from '@/lib/utils';
import { getOrders } from '@/data/mock';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';

export default async function EnhaLakOrdersPage() {
  const allOrders = await getOrders();
  const orders = allOrders.map(order => ({
    idDisplay: `طلب #${order.id.replace('ord-', '').toUpperCase()}`,
    date: new Date(order.createdAt).toLocaleDateString('ar-EG'),
    statusDisplay: <StatusBadge type={order.status === 'paid' ? 'success' : order.status === 'awaiting_verification' ? 'warning' : order.status === 'failed' ? 'danger' : order.status === 'refunded' ? 'neutral' : 'warning'} label={order.status === 'paid' ? 'مدفوع' : order.status === 'awaiting_verification' ? 'بانتظار تأكيد الدفع' : order.status === 'failed' ? 'فشل الدفع' : order.status === 'refunded' ? 'مسترجع' : 'قيد الانتظار'} />,
    total: formatPrice(order.totalAmount),
    itemsDisplay: (
      <div className="flex flex-col gap-1">
        {order.items.map((item, idx) => <span key={idx}>منتج ({item.productId}) - كمية: {item.quantity}</span>)}
      </div>
    ),
  }));

  const columns = [
    { header: 'رقم الطلب', accessorKey: 'idDisplay' },
    { header: 'التاريخ', accessorKey: 'date' },
    { header: 'الإجمالي', accessorKey: 'total' },
    { header: 'المنتجات', accessorKey: 'itemsDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="المنتجات والاشتراكات" />
      <p className="mt-2 text-slate-500 font-medium">سجل طلباتك من معرض وقصص إنها لك.</p>
      <SimpleDataTable columns={columns} data={orders} />
    </div>
  );
}
