'use client';
import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Calendar, Clock, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createDummyBookingServiceOrder, submitBookingPaymentProof } from '@/actions/bookings';

export function BookingConfirmClient() {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'instapay'>('credit_card');
  const [transactionRef, setTransactionRef] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderIdState, setOrderIdState] = useState('');
  const [isPending, startTransition] = useTransition();

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const orderId = await createDummyBookingServiceOrder(250);
      setOrderIdState(orderId);
      
      if (paymentMethod === 'instapay') {
        await submitBookingPaymentProof(orderId, transactionRef);
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
          {paymentMethod === 'instapay' ? 'بانتظار تأكيد الدفع' : 'تم تأكيد الحجز بنجاح!'}
        </h2>
        <p className="mb-8 text-slate-600">
          {paymentMethod === 'instapay' 
            ? 'لقد استلمنا طلب الحجز الخاص بك وجاري مراجعة إيصال الدفع. سنقوم بتأكيد حجزك قريباً.' 
            : 'تم استلام الدفعة وتأكيد موعدك بنجاح. تفاصيل الحجز متوفرة في لوحة التحكم.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/account/orders/creative-writing" className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white transition-colors hover:bg-slate-800">
            تتبع الحجز
          </Link>
          <Link href="/creative-writing" className="rounded-xl bg-slate-100 px-8 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-200">
            العودة للرئيسية
          </Link>
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
          <span className="text-emerald-700">250 ج.م</span>
        </div>
      </div>

      <form onSubmit={handlePaymentSubmit} className="space-y-6">
        <h2 className="text-xl font-black text-slate-800">طريقة الدفع</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className={`cursor-pointer rounded-2xl border-2 p-4 flex items-center gap-3 transition-colors ${paymentMethod === 'credit_card' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white hover:border-emerald-300'}`}>
            <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} className="sr-only" />
            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'credit_card' ? 'border-emerald-500' : 'border-slate-300'}`}>
              {paymentMethod === 'credit_card' && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
            </div>
            <span className="font-bold">بطاقة بنكية</span>
          </label>
          <label className={`cursor-pointer rounded-2xl border-2 p-4 flex items-center gap-3 transition-colors ${paymentMethod === 'instapay' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white hover:border-emerald-300'}`}>
            <input type="radio" name="payment" value="instapay" checked={paymentMethod === 'instapay'} onChange={() => setPaymentMethod('instapay')} className="sr-only" />
            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'instapay' ? 'border-emerald-500' : 'border-slate-300'}`}>
              {paymentMethod === 'instapay' && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
            </div>
            <span className="font-bold">إنستاباي (InstaPay)</span>
          </label>
        </div>

        {paymentMethod === 'credit_card' && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">رقم البطاقة</label>
              <input type="text" required placeholder="0000 0000 0000 0000" dir="ltr" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ الانتهاء</label>
                <input type="text" required placeholder="MM/YY" dir="ltr" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 font-mono text-center" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الرقم السري (CVV)</label>
                <input type="text" required placeholder="123" dir="ltr" maxLength={4} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 font-mono text-center" />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'instapay' && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm font-bold text-slate-700 mb-2">تعليمات الدفع عبر إنستاباي</p>
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-600 mb-2">قم بتحويل المبلغ إلى رقم المحفظة التالي:</p>
              <p className="text-xl font-mono font-black text-emerald-700 select-all">01234567890</p>
            </div>
            <label className="block text-sm font-bold text-slate-700 mb-2">رقم العملية / المرجع (Transaction Reference)</label>
            <input type="text" required value={transactionRef} onChange={e => setTransactionRef(e.target.value)} placeholder="رقم العملية أو المرجع" dir="ltr" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 font-mono text-right" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-md transition-colors hover:bg-emerald-700 disabled:opacity-70"
          >
            {isPending ? 'جاري التنفيذ...' : (paymentMethod === 'instapay' ? 'لقد قمت بالتحويل' : 'تأكيد الحجز والدفع')}
            {!isPending && <CheckCircle2 className="h-5 w-5" />}
          </button>
          <Link
            href="/creative-writing/booking"
            className="flex sm:w-1/3 items-center justify-center gap-2 rounded-xl bg-slate-100 py-4 font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            <ArrowRight className="h-5 w-5" />
            تعديل الموعد
          </Link>
        </div>
      </form>
    </>
  );
}
