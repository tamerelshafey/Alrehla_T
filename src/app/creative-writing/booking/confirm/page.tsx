import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { Calendar, Clock, User, CheckCircle2, ArrowRight } from 'lucide-react';

export default function BookingConfirmPage() {
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-3xl pt-12 pb-24">
        <h1 className="mb-10 text-center text-3xl font-black text-slate-800 md:text-5xl">تأكيد ومراجعة الحجز</h1>
        
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-10">
          
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
              <span className="text-emerald-700">250 د.إ</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/account/bookings"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-md transition-colors hover:bg-emerald-700"
            >
              تأكيد الحجز والدفع
              <CheckCircle2 className="h-5 w-5" />
            </Link>
            <Link
              href="/creative-writing/booking"
              className="flex sm:w-1/3 items-center justify-center gap-2 rounded-xl bg-slate-100 py-4 font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              <ArrowRight className="h-5 w-5" />
              تعديل الموعد
            </Link>
          </div>
          
        </div>
      </div>
    </PageContainer>
  );
}
