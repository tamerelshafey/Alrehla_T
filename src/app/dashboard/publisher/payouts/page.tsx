import { formatPrice } from '@/lib/utils';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { getCurrentUser, getPublisherPayouts } from '@/data/mock';
import { redirect } from 'next/navigation';
import { Wallet, Landmark, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PublisherPayoutsPage() {
  const user = await getCurrentUser();
  if (user.role !== 'publisher') {
    redirect('/dashboard');
  }

  const payouts = await getPublisherPayouts();
  const availableBalance = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const data = payouts.map(p => ({
    period: p.period,
    amount: `${formatPrice(p.amount)}`,
    status: p.status === 'paid' ? (
      <StatusBadge type="success" label="تم التحويل" />
    ) : (
      <StatusBadge type="warning" label="قيد التجميع" />
    )
  }));

  const columns = [
    { header: 'الفترة', accessorKey: 'period' },
    { header: 'المبلغ', accessorKey: 'amount' },
    { header: 'الحالة', accessorKey: 'status' }
  ];

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <DashboardPageHeader title="المستحقات المالية (الناشر)" />

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-2">
              <Wallet className="h-5 w-5" />
              الرصيد المتاح للسحب
            </div>
            <div className="text-4xl font-black text-emerald-600">{formatPrice(availableBalance)}</div>
          </div>
          <button className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition-colors hover:bg-emerald-700">
            طلب سحب الرصيد
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-blue-500" />
            بيانات الدفع الحالية
          </h3>
          <div className="space-y-3 mb-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">طريقة الدفع المفضلة</div>
              <div className="font-bold text-slate-700">تحويل بنكي</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">رقم الحساب / IBAN</div>
              <div className="font-mono text-slate-700 font-bold tracking-widest text-left" dir="ltr">EG90000100000000000000000000</div>
            </div>
          </div>
          <button className="text-sm font-bold text-blue-600 hover:underline">تعديل بيانات الدفع</button>
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 text-sm text-blue-800 mb-8 flex gap-3">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p>يتم احتساب أرباح الناشر بنسبة <strong>70%</strong> من إجمالي المبيعات، ويتم تسوية الحسابات وإتاحة طلب السحب في اليوم الأول من كل شهر ميلادي جديد للمبيعات التي تمت في الشهر السابق.</p>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-4">سجل الدفعات</h3>
      <SimpleDataTable columns={columns} data={data} />
    </div>
  );
}
