import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { BookOpen, DollarSign, ShoppingBag, Star } from 'lucide-react';
import { getCurrentUser, getPublisherOrders } from '@/data/mock';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PublisherDashboard() {
  const user = await getCurrentUser();
  if (user.role !== 'publisher') {
    redirect('/dashboard');
  }

  const orders = await getPublisherOrders();
  
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalEarnings = orders.reduce((sum, o) => sum + o.publisherShare, 0);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`مرحباً، ${user.fullName} (ناشر)`} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="إجمالي المبيعات" value={`${totalSales} ج.م`} icon={ShoppingBag} trend="+12% عن الشهر الماضي" trendUp={true} />
        <StatCard title="أرباحك (70%)" value={`${totalEarnings} ج.م`} icon={DollarSign} trend="جاهزة للسحب: 850 ج.م" trendUp={true} />
        <StatCard title="الكتب المنشورة" value="12 كتاب" icon={BookOpen} />
        <StatCard title="تقييم القراء" value="4.8/5" icon={Star} trend="من 156 تقييم" trendUp={true} />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">أحدث المبيعات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="pb-3 font-bold">المنتج</th>
                  <th className="pb-3 font-bold">التاريخ</th>
                  <th className="pb-3 font-bold">الكمية</th>
                  <th className="pb-3 font-bold">إجمالي البيع</th>
                  <th className="pb-3 font-bold text-emerald-600">أرباحك</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-800">{order.productName}</td>
                    <td className="py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td className="py-4 text-slate-600">{order.quantity}</td>
                    <td className="py-4 text-slate-600">{order.totalAmount} ج.م</td>
                    <td className="py-4 font-bold text-emerald-600">{order.publisherShare} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">طلب سحب الأرباح</h3>
            <p className="text-slate-400 text-sm mb-6">يمكنك سحب أرباحك عند وصول الرصيد القابل للسحب إلى الحد الأدنى (500 ج.م).</p>
            <div className="mb-8">
              <div className="text-sm text-slate-400 mb-1">الرصيد المتاح للسحب</div>
              <div className="text-4xl font-black text-emerald-400">850 <span className="text-xl">ج.م</span></div>
            </div>
          </div>
          <button className="w-full rounded-xl bg-white px-4 py-3 font-bold text-slate-900 transition-colors hover:bg-slate-100">
            طلب سحب الرصيد الآن
          </button>
        </div>
      </div>
    </div>
  );
}
