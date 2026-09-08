import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

export default function BookingPage() {
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-4xl pt-12 pb-24">
        <h1 className="mb-10 text-center text-3xl font-black text-slate-800 md:text-5xl">حجز جلسة استشارية</h1>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg font-medium text-slate-500">
          اختر الوقت المناسب لك للقاء أحد خبرائنا ومناقشة أهدافك في الكتابة الإبداعية.
        </p>
        
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-10">
          <form className="space-y-8">
            {/* Step 1 */}
            <div className="space-y-6">
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">1</div>
                معلوماتك الشخصية
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-emerald-500" placeholder="الاسم" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                  <input type="email" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-emerald-500" placeholder="example@email.com" />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">2</div>
                اختر الموعد المناسب
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">التاريخ</label>
                  <div className="relative">
                    <Calendar className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 font-sans outline-none focus:border-emerald-500 text-right" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">الوقت</label>
                  <div className="relative">
                    <Clock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <select className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 outline-none focus:border-emerald-500 text-slate-700">
                      <option>10:00 صباحاً</option>
                      <option>02:00 مساءً</option>
                      <option>04:30 مساءً</option>
                      <option>06:00 مساءً</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">3</div>
                مجال الاهتمام
              </h2>
              <div className="space-y-2">
                <textarea rows={4} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-emerald-500" placeholder="حدثنا باختصار عن أهدافك وما تود التركيز عليه خلال الجلسة..."></textarea>
              </div>
            </div>

            <Link
              href="/creative-writing/booking/confirm"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-md transition-colors hover:bg-slate-800"
            >
              تأكيد الحجز
              <ArrowRight className="h-5 w-5 rotate-180" />
            </Link>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
