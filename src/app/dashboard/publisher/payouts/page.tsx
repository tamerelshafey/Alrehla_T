import { getCurrentUser, getPublisherPayouts } from '@/data/mock';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Wallet, ArrowRight } from 'lucide-react';
import { PageContainer } from '@/components/PageContainer';

export const dynamic = 'force-dynamic';

export default async function PublisherPayoutsPage() {
  const user = await getCurrentUser();
  if (user.role !== 'publisher') {
    redirect('/dashboard');
  }

  const payouts = await getPublisherPayouts();

  return (
    <PageContainer>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/publisher" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-amber-500">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-amber-500" />
            المستحقات المالية
          </h1>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-6 font-bold">الفترة</th>
              <th className="p-6 font-bold">المبلغ</th>
              <th className="p-6 font-bold">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payouts.map(payout => (
              <tr key={payout.id}>
                <td className="p-6 font-medium text-slate-800">{payout.period}</td>
                <td className="p-6 font-black text-amber-600">{payout.amount.toLocaleString('ar-EG')} ج.م</td>
                <td className="p-6">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    payout.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {payout.status === 'paid' ? 'مدفوع' : 'قيد الانتظار'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
