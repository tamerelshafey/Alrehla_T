import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getOrders, getPersonalizedProducts } from '@/data/mock';
import { hasAdminPermission, formatDate } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageOrders')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const orders = await getOrders();
  const target = orders.find(o => o.id === id) || orders[0];
  const products = await getPersonalizedProducts();

  const formattedItems = target.items.map((item, idx) => {
    const product = products.find(p => p.id === item.productId);
    const price = item.unitPrice || (product ? product.price : 0);
    const quantity = item.quantity || 1;
    return {
      id: idx,
      nameDisplay: product ? product.name : item.productId,
      priceDisplay: `${price} ج.م`,
      quantity: quantity,
      totalDisplay: `${price * quantity} ج.م`
    };
  });

  const columns = [
    { header: 'المنتج', accessorKey: 'nameDisplay' },
    { header: 'السعر', accessorKey: 'priceDisplay' },
    { header: 'الكمية', accessorKey: 'quantity' },
    { header: 'الإجمالي', accessorKey: 'totalDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`تفاصيل الطلب #${target.id.split('-')[1]}`} backHref="/dashboard/admin/orders" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <div className="text-sm text-slate-500 mb-1">تاريخ الطلب: {formatDate(target.createdAt)}</div>
            <div className="text-sm text-slate-500">حالة الدفع: {target.status === 'paid' ? 'تم الدفع' : 'معلق'}</div>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl bg-slate-900 px-6 py-2 font-bold text-white transition-colors hover:bg-slate-800">
              تحديث حالة الشحن (مشحون)
            </button>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-4">محتويات الطلب</h3>
        <SimpleDataTable columns={columns} data={formattedItems} />
        
        <div className="mt-6 border-t border-slate-100 pt-6 flex justify-end">
          <div className="text-2xl font-black text-slate-800">الإجمالي: {target.totalAmount} ج.م</div>
        </div>
      </div>
    </div>
  );
}
