import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { getSubscriptionTiers } from '@/data/mock';
import { PackageOpen, Sparkles, Gift, Activity, Check } from 'lucide-react';
import { SVGProps } from 'react';

import { PageContainer } from '@/components/PageContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';



export default async function SubscriptionPage() {
  const tiers = await getSubscriptionTiers();

  const benefits = [
    { title: 'قصة مخصصة جديدة', icon: BookOpenIcon },
    { title: 'أنشطة تفاعلية', icon: Activity },
    { title: 'هدية إضافية', icon: Gift },
  ];

  return (
    <PageContainer className="!py-0 !space-y-0">
      {/* Header */}
      <SectionHeader
        title="صندوق الرحلة"
        icon={<PackageOpen className="h-8 w-8" />}
        iconClassName="bg-rose-50 text-rose-600"
        
        description="اشتراك يضمن متعة متجددة لطفلك كل شهر، مع مفاجآت تُصنع خصيصًا له وتصله حتى باب المنزل."
      />

      {/* Pricing */}
      <Section containerClassName="max-w-5xl">
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier, index) => {
            const isPopular = index === 1;
            return (
              <Card
                key={tier.id}
                accentColor="rose"
                className={`relative flex flex-col p-8 ${isPopular ? 'z-10 scale-105 border-rose-300 shadow-xl shadow-rose-500/10' : 'shadow-sm'}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-rose-600 px-4 py-1 text-xs font-bold text-white shadow-sm">
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
                      {formatPrice(tier.priceMonthly)}
                    </span>
                    <span className="font-medium text-slate-500">
                      / شهر
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-500">
                    إجمالي الدفع: {formatPrice(tier.priceTotal)}
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
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                          <Check className="h-3 w-3 font-bold" />
                        </div>
                        <span className="font-medium text-slate-700">
                          {benefit.title}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <Button
                  href={`/enha-lak/custom-subscription/${tier.id}`}
                  accentColor="rose"
                  className={`w-full justify-center shadow-md ${isPopular ? '!bg-rose-600 !text-white hover:!bg-rose-700' : '!bg-slate-900 !text-white hover:!bg-slate-800'}`}
                >
                  اختر الخطة
                </Button>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* What's in the box */}
      <Section containerClassName="max-w-4xl rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-center md:p-12 pb-24">
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
      </Section>
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
