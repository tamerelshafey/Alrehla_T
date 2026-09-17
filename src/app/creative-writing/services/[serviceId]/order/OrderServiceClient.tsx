'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { createServiceOrder, submitServiceOrderPayment } from '@/actions/service-orders';
import { PaymentProofForm, type PaymentMethod } from '@/components/checkout/PaymentProofForm';

interface Props {
  /** Read from site settings — it used to be the placeholder {paymentWalletNumber}. */
  paymentWalletNumber: string;
  /** InstaPay QR from site settings, when one has been uploaded. */
  paymentQrUrl?: string;
  serviceId: string;
  serviceName: string;
  providerId: string | null;
  providerName: string | null;
  amount: number;
}

export function OrderServiceClient({
  serviceId,
  serviceName,
  providerId,
  providerName,
  amount,
  paymentWalletNumber,
  paymentQrUrl,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [placed, setPlaced] = useState<{ id: string; reference: string } | null>(null);

  /** الخطوة الأولى: تسجيل الطلب — منه بييجي الرقم المرجعي. */
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await createServiceOrder({ serviceId, providerId });
        setPlaced({ id: result.orderId, reference: result.paymentReference });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'تعذّر إنشاء الطلب');
      }
    });
  };

  /** الخطوة التانية: الإيصال بعد التحويل. */
  const handleReceipt = (payment: { method: PaymentMethod; receiptUrl: string }) => {
    if (!placed) return;
    setError(null);
    startTransition(async () => {
      const result = await submitServiceOrderPayment(placed.id, payment);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push('/account/orders/creative-writing');
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <h2 className="mb-6 text-xl font-black text-slate-800">ملخص الطلب</h2>

        <div className="flex justify-between border-b border-slate-100 py-3">
          <span className="font-medium text-slate-500">الخدمة</span>
          <span className="font-bold text-slate-800">{serviceName}</span>
        </div>

        {providerName && (
          <div className="flex justify-between border-b border-slate-100 py-3">
            <span className="font-medium text-slate-500">مقدّم الخدمة</span>
            <span className="font-bold text-slate-800">{providerName}</span>
          </div>
        )}

        <div className="flex justify-between py-3">
          <span className="font-medium text-slate-500">الإجمالي</span>
          <span className="text-2xl font-black text-emerald-600">{formatPrice(amount)}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {placed ? (
        <PaymentProofForm
          reference={placed.reference}
          amount={amount}
          walletNumber={paymentWalletNumber}
          qrUrl={paymentQrUrl}
          accent="emerald"
          busy={isPending}
          onSubmit={handleReceipt}
        />
      ) : (
        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-sm font-medium text-slate-600">
            الدفع بالتحويل (إنستاباي أو فودافون كاش). سجّل الطلب الأول، وهيظهرلك
            رقم مرجعي تكتبه في ملاحظة التحويل، وبعدها ترفع صورة الإيصال.
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 font-black text-white shadow-lg transition-colors hover:bg-emerald-700 disabled:opacity-70"
          >
            <CheckCircle2 className="h-5 w-5" />
            {isPending ? 'جاري تسجيل الطلب...' : 'سجّل الطلب واعرض بيانات التحويل'}
          </button>
        </form>
      )}
    </div>
  );
}
