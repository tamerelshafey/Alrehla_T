import { getSubscriptionTiers } from '@/data/mock';
import { PackageOpen, Sparkles, Gift, Activity, Check } from 'lucide-react';
import { SVGProps } from 'react';
import { SectionSubNav } from '@/components/SectionSubNav';
import { PageContainer } from '@/components/PageContainer';
import { SectionHeader } from '@/components/SectionHeader';

const enhaLakTabs = [
  { name: 'نظرة عامة', href: '/enha-lak' },
  { name: 'أنت البطل هنا', href: '/enha-lak/custom' },
  { name: 'المكتبة العامة', href: '/enha-lak/library' },
  { name: 'صندوق الرحلة', href: '/enha-lak/subscription' },
];

export default async function SubscriptionPage() {
  const tiers = await getSubscriptionTiers();

  const benefits = [
    { title: 'قصة مخصصة جديدة', icon: BookOpenIcon },
    { title: 'أنشطة تفاعلية', icon: Activity },
    { title: 'هدية إضافية', icon: Gift },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="صندوق الرحلة"
        icon={<PackageOpen className="h-8 w-8" />}
        iconClassName="bg-purple-50 text-purple-600"
        subNav={
          <SectionSubNav
            tabs={enhaLakTabs}
            activeColorClass="bg-rose-600 text-white"
          />
        }
        description="اشتراك يضمن متعة متجددة لطفلك كل شهر، مع مفاجآت تُصنع خصيصًا له وتصله حتى باب المنزل."
      />

      {/* Pricing */}
      <section className="mx-auto w-full max-w-5xl">
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier, index) => {
            const isPopular = index === 1;
            return (
              <div
                key={tier.id}
                className={`relative border bg-white ${isPopular ? 'z-10 scale-105 border-purple-300 shadow-xl shadow-purple-500/10' : 'border-slate-200 shadow-sm'} flex flex-col rounded-3xl p-8`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-purple-600 px-4 py-1 text-xs font-bold text-white shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    الأكثر طلباً
                  </div>
                )}

                <h3 className="mb-2 text-2xl font-bold text-slate-800">
                  {tier.name}
                </h3>

                <div className="my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">
                      {tier.priceMonthly.toLocaleString('ar-EG')}
                    </span>
                    <span className="font-medium text-slate-500">
                      ج.م / شهر
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-500">
                    إجمالي الدفع: {tier.priceTotal.toLocaleString('ar-EG')} ج.م
                  </div>
                </div>

                {tier.savingsNote && (
                  <div className="mb-6 rounded-xl bg-emerald-50 px-4 py-2 text-center text-sm font-bold text-emerald-700">
                    {tier.savingsNote}
                  </div>
                )}

                <ul className="mb-8 flex-1 space-y-4">
                  {benefits.map((benefit, i) => {
                    return (
                      <li key={i} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                          <Check className="h-3 w-3 font-bold" />
                        </div>
                        <span className="font-medium text-slate-700">
                          {benefit.title}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <button
                  className={`w-full rounded-xl py-4 text-sm font-bold shadow-md transition-colors ${isPopular ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  اختر الخطة
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* What's in the box */}
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-center md:p-12">
        <h2 className="mb-10 text-3xl font-black text-slate-800">
          ماذا سأحصل عليه شهريًا؟
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex flex-col items-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {benefit.title}
                </h3>
              </div>
            );
          })}
        </div>
      </section>
    </PageContainer>
  );
}
function BookOpenIcon(props: SVGProps<SVGSVGElement>) {
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
  );
}
