import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'حجز جلسة',
    description: 'اختر الباقة والمدرب والموعد المناسب لجلستك.',
    path: '/creative-writing/booking',
    noIndex: true,
  });
}

import { Suspense } from 'react';
import { PageContainer } from '@/components/PageContainer';
import { BookingWizardClient } from '@/components/creative-writing/BookingWizardClient';
import { getInstructors, getWritingPackages } from '@/data/domains/writing';
import { Section } from '@/components/ui/Section';

export default async function BookingPage() {
  const [instructors, packages] = await Promise.all([
    getInstructors(),
    getWritingPackages(),
  ]);
  return (
    <PageContainer className="!py-0 !space-y-0">
      <Section containerClassName="mx-auto w-full max-w-4xl pt-12 pb-24">
        <h1 className="mb-10 text-center text-3xl font-black text-slate-800 md:text-5xl">حجز مسار تدريبي</h1>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg font-medium text-slate-500">
          اختر الباقة المناسبة والمدرب، ثم حدد موعدك الأسبوعي الثابت طوال فترة التدريب.
        </p>
        <Suspense fallback={<div className="p-8 text-center font-medium text-slate-500">جاري التحميل…</div>}>
        <BookingWizardClient
          instructors={instructors}
          packages={packages
            .filter((pkg) => pkg.isActive)
            .map((pkg) => ({ id: pkg.id, name: pkg.name, price: pkg.price }))}
        />
        </Suspense>
      </Section>
    </PageContainer>
  );
}
