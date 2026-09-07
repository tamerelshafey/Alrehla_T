import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { CreditCard, MapPin, CheckCircle2, User } from 'lucide-react';

export default function CheckoutPage() {
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-5xl pt-12 pb-24">
        <h1 className="mb-10 text-3xl font-black text-slate-800 md:text-5xl">الدفع والإتمام</h1>
        
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            
            {/* User Details */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <User className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-black text-slate-800">البيانات الشخصية</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-amber-500" placeholder="الاسم" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                  <input type="tel" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-amber-500" placeholder="05x xxx xxxx" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-black text-slate-800">عنوان التوصيل</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">العنوان التفصيلي</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-amber-500" placeholder="اسم الشارع، رقم المبنى..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">المدينة</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-amber-500">
                    <option>دبي</option>
                    <option>أبوظبي</option>
                    <option>الشارقة</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-black text-slate-800">طريقة الدفع</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">رقم البطاقة</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-amber-500" placeholder="xxxx xxxx xxxx xxxx" />
                </div>
                <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">تاريخ الانتهاء</label>
                    <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-amber-500" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">CVC</label>
                    <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-amber-500" placeholder="123" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
              <h2 className="mb-6 text-xl font-black text-slate-800">مراجعة الطلب</h2>
              
              <div className="space-y-4 border-b border-slate-200 pb-6">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>المجموع الفرعي</span>
                  <span>1,250 د.إ</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>الضريبة (5%)</span>
                  <span>62.5 د.إ</span>
                </div>
              </div>
              
              <div className="flex justify-between py-6 text-xl font-black text-slate-800">
                <span>الإجمالي</span>
                <span>1,312.5 د.إ</span>
              </div>
              
              <Link
                href="/payment-status"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 font-bold text-white shadow-md transition-colors hover:bg-amber-600"
              >
                تأكيد ودفع
                <CheckCircle2 className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
