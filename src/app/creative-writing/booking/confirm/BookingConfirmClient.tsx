'use client';
import { formatPrice } from '@/lib/utils';
import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Calendar, Clock, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { createCourseBooking, submitBookingPaymentProof } from '@/actions/bookings';
import { PaymentProofForm, type PaymentMethod } from '@/components/checkout/PaymentProofForm';
import { Button } from '@/components/ui/Button';
import { TransferInstructions } from '@/components/checkout/TransferInstructions';

export function BookingConfirmClient({
  paymentWalletNumber,
  paymentQrUrl,
  packageId,
  packageName,
  packagePrice,
  instructorId,
  instructorName,
  preferredSlot,
  presetChildId,
}: {
  paymentWalletNumber: string;
  paymentQrUrl?: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  instructorId?: string;
  instructorName?: string;
  /** الموعد الأسبوعي اللي العميل اختاره في المعالج، بعد التأكد إنه في جدول المدرب. */
  preferredSlot?: { day: string; time: string };
  /**
   * المشارك محدَّد مسبقًا — بييجي من موافقة ولي الأمر على طلب ابنه.
   * من غيره كان لازم يختاره بإيده، فيحجز باسمه هو بالغلط.
   */
  presetChildId?: string;
}) {
  const [participantType, setParticipantType] = useState<'self' | 'child'>(
    presetChildId ? 'child' : 'self',
  );
  const [childId, setChildId] = useState<string>(presetChildId ?? '');
  const [children, setChildren] = useState<{id:string, name:string}[]>([]);

  React.useEffect(() => {
    import('@/app/actions/family').then(mod => mod.fetchFamilyMembers()).then(data => setChildren(data ? data.map((d: any) => ({id: d.id, name: d.fullName})) : []));
  }, []);

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<{ id: string; reference: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  /** الخطوة الأولى: تسجيل الحجز — منها بييجي الرقم المرجعي. */
  const handleRegisterBooking = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      setError('');
      if (participantType === 'child' && !childId) {
        setError('اختار المشارك الأول');
        return;
      }

      // المبلغ مش بيتبعت من هنا: القاعدة بتاخده من سعر الباقة.
      const result = await createCourseBooking({
        packageId,
        instructorId,
        participantType,
        childId: childId || undefined,
        preferredSlot,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setBooking({ id: result.subscriptionId, reference: result.paymentReference });
    });
  };

  /** الخطوة التانية: الإيصال بعد التحويل. */
  const handleReceipt = (payment: { method: PaymentMethod; receiptUrl: string }) => {
    if (!booking) return;
    startTransition(async () => {
      setError('');
      const result = await submitBookingPaymentProof(booking.id, payment);
      if (!result.success) {
        setError(result.error ?? 'تعذّر إرسال الإيصال');
        return;
      }
      setIsSuccess(true);
    });
  };

  if (isSuccess) {
    return (
      <div className="text-center animate-in fade-in slide-in-from-top-4">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="mb-4 text-3xl font-black text-slate-800">
          بانتظار تأكيد الدفع
        </h2>
        <p className="mb-8 text-slate-600">
          لقد استلمنا طلب الحجز الخاص بك وجاري مراجعة التحويل. سنؤكد حجزك قريبًا.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/account/orders/creative-writing" variant="neutral" className="px-8 py-3">
            تتبع الحجز
          </Button>
          <Button href="/creative-writing" variant="secondary" accentColor="emerald" className="px-8 py-3">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 rounded-2xl bg-slate-50 p-6 border border-slate-100">
        <h2 className="mb-6 text-xl font-bold text-slate-800">تفاصيل الجلسة</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-500" />
              <span>المدرب</span>
            </div>
            <span className="font-bold text-slate-900">
              {instructorName ?? 'يحدده فريق المنصة'}
            </span>
          </div>
          <div className="flex items-center justify-between font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-500" />
              <span>الباقة</span>
            </div>
            <span className="font-bold text-slate-900">{packageName}</span>
          </div>
          {/* التاريخ والوقت كانوا معروضين هنا: تاريخ النهاردة و«04:30 مساءً»
              مكتوبين في الكود. الجدولة الحقيقية بتحصل بعد تأكيد الدفع. */}
          <div className="flex items-center justify-between font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              <span>الموعد</span>
            </div>
            <span className="font-bold text-slate-900">يتحدد بعد تأكيد الدفع</span>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl bg-emerald-50 p-6 border border-emerald-100">
        <h2 className="mb-4 text-lg font-bold text-slate-800">ملخص الدفع</h2>
        <div className="flex justify-between text-xl font-black text-slate-900">
          <span>قيمة الباقة</span>
          <span className="text-emerald-700">{formatPrice(packagePrice)}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {booking ? (
        <PaymentProofForm
          reference={booking.reference}
          amount={packagePrice}
          walletNumber={paymentWalletNumber}
          qrUrl={paymentQrUrl}
          accent="emerald"
          busy={isPending}
          onSubmit={handleReceipt}
        />
      ) : (
        <form onSubmit={handleRegisterBooking} className="space-y-6">
          <h2 className="text-xl font-black text-slate-800">طريقة الدفع</h2>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm font-medium text-slate-600">
            الدفع بالتحويل (إنستاباي أو فودافون كاش). سجّل الحجز الأول، وهيظهرلك
            رقم مرجعي تكتبه في ملاحظة التحويل، وبعدها ترفع صورة الإيصال.
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              disabled={isPending}
              accentColor="emerald"
              className="flex-1 py-4 text-center disabled:opacity-70"
            >
              {isPending ? 'جارٍ تسجيل الحجز…' : 'سجّل الحجز واعرض بيانات التحويل'}
              {!isPending && <CheckCircle2 className="h-5 w-5" />}
            </Button>
            <Button
              href="/creative-writing/booking"
              variant="secondary"
              accentColor="emerald"
              className="sm:w-1/3 py-4 text-center"
            >
              <ArrowRight className="h-5 w-5" />
              تعديل الاختيار
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
