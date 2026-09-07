
import { getOrders } from '@/data/mock';

export default async function EnhaLakOrdersPage() {
  const orders = await getOrders();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">طلبات إنها لك</h1>
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4 font-medium">رقم الطلب</th>
              <th className="p-4 font-medium">التاريخ</th>
              <th className="p-4 font-medium">الإجمالي</th>
              <th className="p-4 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map(order => (
              <tr key={order.id}>
                <td className="p-4 font-bold text-slate-700">{order.id}</td>
                <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                <td className="p-4 font-medium text-slate-700">{order.totalAmount} ج.م</td>
                <td className="p-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${order.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
