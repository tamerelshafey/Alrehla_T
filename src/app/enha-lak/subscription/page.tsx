import { getSubscriptionTiers } from '@/data/mock';
import { PackageOpen, Sparkles, Gift, Activity, Check } from 'lucide-react';

export default async function SubscriptionPage() {
  const tiers = await getSubscriptionTiers();

  const benefits = [
    { title: 'قصة مخصصة جديدة', icon: BookOpenIcon },
    { title: 'أنشطة تفاعلية', icon: Activity },
    { title: 'هدية إضافية', icon: Gift },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Header */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="w-16 h-16 mx-auto bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
          صندوق الرحلة
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          اشتراك يضمن متعة متجددة لطفلك كل شهر، مع مفاجآت تُصنع خصيصًا له وتصله حتى باب المنزل.
        </p>
      </section>

      {/* Pricing */}
      <section className="w-full max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => {
            const isPopular = index === 1;
            return (
              <div key={tier.id} className={`relative bg-white border ${isPopular ? 'border-purple-300 shadow-xl shadow-purple-500/10 scale-105 z-10' : 'border-slate-200 shadow-sm'} rounded-3xl p-8 flex flex-col`}>
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    الأكثر طلباً
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{tier.name}</h3>
                
                <div className="my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">{tier.priceMonthly.toLocaleString('ar-EG')}</span>
                    <span className="text-slate-500 font-medium">ج.م / شهر</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-2 font-medium">
                    إجمالي الدفع: {tier.priceTotal.toLocaleString('ar-EG')} ج.م
                  </div>
                </div>

                {tier.savingsNote && (
                  <div className="bg-emerald-50 text-emerald-700 text-sm font-bold py-2 px-4 rounded-xl mb-6 text-center">
                    {tier.savingsNote}
                  </div>
                )}

                <ul className="space-y-4 mb-8 flex-1">
                  {benefits.map((benefit, i) => {
                    const Icon = benefit.icon;
                    return (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 font-bold" />
                        </div>
                        <span className="text-slate-700 font-medium">{benefit.title}</span>
                      </li>
                    );
                  })}
                </ul>

                <button className={`w-full py-4 rounded-xl font-bold text-sm shadow-md transition-colors ${isPopular ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  اختر الخطة
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* What's in the box */}
      <section className="w-full max-w-4xl mx-auto bg-slate-50/50 rounded-3xl p-8 md:p-12 border border-slate-100 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-10">ماذا سأحصل عليه شهريًا؟</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm mb-4">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{benefit.title}</h3>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

function BookOpenIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
