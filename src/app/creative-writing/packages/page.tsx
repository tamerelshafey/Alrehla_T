import Link from 'next/link';
import { getWritingPackages } from '@/data/mock';
import { Target, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export default async function PackagesPage() {
  const packages = await getWritingPackages();
  
  const under12 = packages.filter(p => p.ageGroup === 'under_12');
  const over12 = packages.filter(p => p.ageGroup === '12_plus');

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Header */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
          باقات «بداية الرحلة»
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          ست رحلات تختلف في طول المسار وعدد الجلسات، موزعة على مسارين عمريين. قارن ما تتضمنه كل رحلة ثم اختر ما يناسب المشارك.
        </p>
      </section>

      {/* Tabs / Filters (Visual only for now, can be implemented with state later) */}
      <div className="w-full max-w-6xl mx-auto space-y-20">
        
        {/* Track 1: Under 12 */}
        <section>
          <div className="mb-10 text-center md:text-right">
            <h2 className="text-3xl font-black text-slate-800">مسار الإبداع التأسيسي</h2>
            <p className="text-slate-500 font-medium mt-2">لأعمار دون 12 سنة</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {under12.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>

        {/* Track 2: 12 Plus */}
        <section>
          <div className="mb-10 text-center md:text-right">
            <h2 className="text-3xl font-black text-slate-800">مسار اليافعين والكبار</h2>
            <p className="text-slate-500 font-medium mt-2">12 سنة فأعلى</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {over12.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </section>

      </div>

      {/* Help Link */}
      <div className="w-full max-w-4xl mx-auto text-center mt-12 bg-slate-50 border border-slate-100 p-6 rounded-2xl">
        <p className="text-slate-600 font-medium text-lg">
          غير متأكد أي باقة تناسبك؟ <Link href="/support" className="text-amber-600 font-bold hover:underline">تواصل معنا وسنساعدك على فهم الفروق قبل الحجز.</Link>
        </p>
      </div>

    </div>
  );
}

function PackageCard({ pkg }: { pkg: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-2xl font-black text-slate-800">{pkg.name}</h3>
        <div className="bg-amber-50 text-amber-700 font-black px-4 py-2 rounded-xl">
          {pkg.price.toLocaleString('ar-EG')} ج.م
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <Calendar className="w-5 h-5 mx-auto text-slate-400 mb-2" />
          <div className="text-xs text-slate-500 font-medium">المدة</div>
          <div className="text-sm font-bold text-slate-800">{pkg.durationText}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <Target className="w-5 h-5 mx-auto text-slate-400 mb-2" />
          <div className="text-xs text-slate-500 font-medium">الجلسات</div>
          <div className="text-sm font-bold text-slate-800">{pkg.sessionsCount} جلسة</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <Clock className="w-5 h-5 mx-auto text-slate-400 mb-2" />
          <div className="text-xs text-slate-500 font-medium">مدة الجلسة</div>
          <div className="text-sm font-bold text-slate-800">{pkg.sessionDuration}</div>
        </div>
      </div>

      <div className="flex-1 space-y-6 mb-8">
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            لمن تناسب؟
          </h4>
          <p className="text-slate-600 font-medium text-sm leading-relaxed">{pkg.targetAudience}</p>
        </div>
        
        {pkg.prerequisiteNote && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ملاحظة</h4>
            <p className="text-slate-700 font-medium text-sm leading-relaxed">{pkg.prerequisiteNote}</p>
          </div>
        )}
      </div>

      <Link href="/creative-writing/booking" className="w-full py-4 text-center bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-colors mt-auto">
        اكتشف المدربين والأسعار
      </Link>
    </div>
  );
}
