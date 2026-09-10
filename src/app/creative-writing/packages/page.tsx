import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { getWritingPackages } from '@/data/mock';
import { Target, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { WritingPackage } from '@/types';

import { PageContainer } from '@/components/PageContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function PackagesPage() {
  const packages = await getWritingPackages();

  const under12 = packages.filter((p) => p.ageGroup === 'under_12');
  const over12 = packages.filter((p) => p.ageGroup === '12_plus');

  return (
    <PageContainer className="!py-0 !space-y-0">
      {/* Header */}
      <Section containerClassName="pt-8 pb-12">
        <SectionHeader
          title="باقات «بداية الرحلة»"
          
          description="ست رحلات تختلف في طول المسار وعدد الجلسات، موزعة على مسارين عمريين. قارن ما تتضمنه كل رحلة ثم اختر ما يناسب المشارك."
        />
      </Section>

      {/* Tabs / Filters (Visual only for now, can be implemented with state later) */}
      <div className="mx-auto w-full max-w-6xl space-y-20 pb-20">
        {/* Track 1: Under 12 */}
        <Section>
          <div className="mb-10 text-center md:text-right">
            <h2 className="text-3xl font-black text-slate-800">
              مسار الإبداع التأسيسي
            </h2>
            <p className="mt-2 font-medium text-slate-500">لأعمار دون 12 سنة</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {under12.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </Section>

        {/* Track 2: 12 Plus */}
        <Section>
          <div className="mb-10 text-center md:text-right">
            <h2 className="text-3xl font-black text-slate-800">
              مسار اليافعين والكبار
            </h2>
            <p className="mt-2 font-medium text-slate-500">12 سنة فأعلى</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {over12.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </Section>
      </div>

      {/* Help Link */}
      <Section containerClassName="pb-20">
        <Card accentColor="emerald" className="mx-auto w-full max-w-4xl p-6 text-center bg-slate-50">
          <p className="text-lg font-medium text-slate-600">
            غير متأكد أي باقة تناسبك؟{' '}
            <Link
              href="/support"
              className="font-bold text-emerald-600 hover:underline"
            >
              تواصل معنا وسنساعدك على فهم الفروق قبل الحجز.
            </Link>
          </p>
        </Card>
      </Section>
    </PageContainer>
  );
}

function PackageCard({ pkg }: { pkg: WritingPackage }) {
  return (
    <Card accentColor="emerald" className="flex flex-col p-8">
      <div className="mb-6 flex items-start justify-between">
        <h3 className="text-2xl font-black text-slate-800">{pkg.name}</h3>
        <div className="rounded-xl bg-emerald-50 px-4 py-2 font-black text-emerald-700">
          {formatPrice(pkg.price)}
        </div>
      </div>

      <div
        className={`grid ${pkg.sessionDuration ? 'grid-cols-3' : 'grid-cols-2'} mb-8 gap-4`}
      >
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <Calendar className="mx-auto mb-2 h-5 w-5 text-slate-400" />
          <div className="text-xs font-medium text-slate-500">المدة</div>
          <div className="text-sm font-bold text-slate-800">
            {pkg.durationText}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <Target className="mx-auto mb-2 h-5 w-5 text-slate-400" />
          <div className="text-xs font-medium text-slate-500">الجلسات</div>
          <div className="text-sm font-bold text-slate-800">
            {pkg.sessionsCount} جلسة
          </div>
        </div>
        {pkg.sessionDuration && (
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <Clock className="mx-auto mb-2 h-5 w-5 text-slate-400" />
            <div className="text-xs font-medium text-slate-500">مدة الجلسة</div>
            <div className="text-sm font-bold text-slate-800">
              {pkg.sessionDuration}
            </div>
          </div>
        )}
      </div>

      <div className="mb-8 flex-1 space-y-6">
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            لمن تناسب؟
          </h4>
          <p className="text-sm leading-relaxed font-medium text-slate-600">
            {pkg.targetAudience}
          </p>
        </div>

        {pkg.prerequisiteNote && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
              ملاحظة
            </h4>
            <p className="text-sm leading-relaxed font-medium text-slate-700">
              {pkg.prerequisiteNote}
            </p>
          </div>
        )}
      </div>

      <Button
        href="/creative-writing/booking"
        accentColor="emerald"
        className="mt-auto w-full py-4 text-center"
      >
        اكتشف المدربين والأسعار
      </Button>
    </Card>
  );
}
