'use client';
import { formatPrice } from '@/lib/utils';
import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Calendar, Clock, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createDummyBookingServiceOrder, submitBookingPaymentProof } from '@/actions/bookings';
import { Button } from '@/components/ui/Button';
import { TransferInstructions } from '@/components/checkout/TransferInstructions';

export function BookingConfirmClient({
  paymentWalletNumber,
  paymentQrUrl,
}: {
  paymentWalletNumber: string;
  paymentQrUrl?: string;
}) {
  const searchParams = useSearchParams();
  const packageId = searchParams?.get('package') || 'dummy-package';
  const instructorId = searchParams?.get('instructor') || 'dummy-instructor';
  const [participantType, setParticipantType] = useState<'self' | 'child'>('self');
  const [childId, setChildId] = useState<string>('');
  const [children, setChildren] = useState<{id:string, name:string}[]>([]);

  React.useEffect(() => {
    import('@/app/actions/family').then(mod => mod.fetchFamilyMembers()).then(data => setChildren(data ? data.map((d: any) => ({id: d.id, name: d.fullName})) : []));
  }, []);

  const [transactionRef, setTransactionRef] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderIdState, setOrderIdState] = useState('');
  const [isPending, startTransition] = useTransition();

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (participantType === 'child' && !childId) { alert('الرجاء اختيار الطفل'); return; }
const orderId = await createDummyBookingServiceOrder(250, packageId, instructorId, participantType, childId);
      setOrderIdState(orderId);
      
      await submitBookingPaymentProof(orderId, transactionRef);
      
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
          <Button href="/account/orders/creative-writing" accentColor="emerald" className="!bg-slate-900 !text-white hover:!bg-slate-800 px-8 py-3">
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
            <span className="font-bold text-slate-900">سارة أحمد</span>
          </div>
          <div className="flex items-center justify-between font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-500" />
              <span>التاريخ</span>
            </div>
            <span className="font-bold text-slate-900">{new Date().toLocaleDateString('ar-EG')}</span>
          </div>
          <div className="flex items-center justify-between font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              <span>الوقت</span>
            </div>
            <span className="font-bold text-slate-900">04:30 مساءً</span>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl bg-emerald-50 p-6 border border-emerald-100">
        <h2 className="mb-4 text-lg font-bold text-slate-800">ملخص الدفع</h2>
        <div className="flex justify-between text-xl font-black text-slate-900">
          <span>قيمة الجلسة الاستشارية</span>
          <span className="text-emerald-700">{formatPrice(250)}</span>
        </div>
      </div>

      <form onSubmit={handlePaymentSubmit} className="space-y-6">
        <h2 className="text-xl font-black text-slate-800">طريقة الدفع</h2>
        
        {/* A card form used to sit here whose inputs nothing ever read: the
            customer typed a real card number and was shown a success screen
            without a penny being charged. Transfer only until a real payment
            gateway is integrated. */}
        <div className="animate-in fade-in slide-in-from-top-2 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="mb-2 text-sm font-bold text-slate-700">
            تعليمات التحويل (إنستاباي / محفظة إلكترونية)
          </p>
          <TransferInstructions
            walletNumber={paymentWalletNumber}
            qrUrl={paymentQrUrl}
            accent="emerald"
          />
          <label className="mb-2 block text-sm font-bold text-slate-700">
            رقم العملية / المرجع (Transaction Reference)
          </label>
          <input
            type="text"
            required
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            placeholder="رقم العملية أو المرجع"
            dir="ltr"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-right font-mono outline-none focus:border-emerald-500"
          />
          <p className="mt-2 text-xs font-medium text-slate-500">
            حجزك يُسجَّل فورًا، وتُراجعه الإدارة وتؤكد استلام المبلغ.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            disabled={isPending}
            accentColor="emerald"
            className="flex-1 py-4 text-center disabled:opacity-70"
          >
            {isPending ? 'جارٍ تسجيل الحجز…' : 'لقد قمت بالتحويل'}
            {!isPending && <CheckCircle2 className="h-5 w-5" />}
          </Button>
          <Button
            href="/creative-writing/booking"
            variant="secondary"
            accentColor="emerald"
            className="sm:w-1/3 py-4 text-center"
          >
            <ArrowRight className="h-5 w-5" />
            تعديل الموعد
          </Button>
        </div>
      </form>
    </>
  );
}
