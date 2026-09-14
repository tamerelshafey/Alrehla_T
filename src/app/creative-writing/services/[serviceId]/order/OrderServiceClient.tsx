'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { createServiceOrder } from '@/actions/service-orders';

interface Props {
  /** Read from site settings — it used to be the placeholder {paymentWalletNumber}. */
  paymentWalletNumber: string;
  serviceId: string;
  serviceName: string;
  instructorId: string | null;
  instructorName: string | null;
  amount: number;
}

export function OrderServiceClient({
  serviceId,
  serviceName,
  instructorId,
  instructorName,
  amount,
  paymentWalletNumber,
}: Props) {
  const router = useRouter();
  const [transactionRef, setTransactionRef] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      setError('من فضلك أدخل رقم العملية بعد التحويل');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createServiceOrder({
          serviceId,
          instructorId,
          transactionReference: transactionRef.trim(),
        });
        router.push('/account/orders/creative-writing');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'تعذّر إنشاء الطلب');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <h2 className="mb-6 text-xl font-black text-slate-800">ملخص الطلب</h2>

        <div className="flex justify-between border-b border-slate-100 py-3">
          <span className="font-medium text-slate-500">الخدمة</span>
          <span className="font-bold text-slate-800">{serviceName}</span>
        </div>

        {instructorName && (
          <div className="flex justify-between border-b border-slate-100 py-3">
            <span className="font-medium text-slate-500">المدرب</span>
            <span className="font-bold text-slate-800">{instructorName}</span>
          </div>
        )}

        <div className="flex justify-between py-3">
          <span className="font-medium text-slate-500">الإجمالي</span>
          <span className="text-2xl font-black text-emerald-600">{formatPrice(amount)}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
        <p className="mb-2 text-sm font-bold text-slate-700">تعليمات الدفع عبر إنستاباي</p>
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm text-slate-600">قم بتحويل المبلغ إلى رقم المحفظة التالي:</p>
          <p className="select-all font-mono text-xl font-black text-rose-700">{paymentWalletNumber}</p>
        </div>

        <label htmlFor="ref" className="mb-2 block text-sm font-bold text-slate-700">
          رقم العملية / المرجع
        </label>
        <input
          id="ref"
          type="text"
          dir="ltr"
          value={transactionRef}
          onChange={(e) => setTransactionRef(e.target.value)}
          placeholder="رقم العملية أو المرجع"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-right font-mono outline-none focus:border-emerald-500"
        />
        <p className="mt-2 text-xs text-slate-500">
          سيتم مراجعة التحويل وتأكيد الطلب من قِبل الإدارة.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 font-black text-white shadow-lg transition-colors hover:bg-emerald-700 disabled:opacity-70"
      >
        <CheckCircle2 className="h-5 w-5" />
        {isPending ? 'جاري إرسال الطلب...' : 'لقد قمت بالتحويل'}
      </button>
    </form>
  );
}
