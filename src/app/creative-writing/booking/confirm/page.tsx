import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'تأكيد الحجز',
    description: 'مراجعة تفاصيل الحجز وإتمامه.',
    path: '/creative-writing/booking/confirm',
    noIndex: true,
  });
}

import { getSiteSettings } from '@/data/domains/content';

import { PageContainer } from '@/components/PageContainer';
import { BookingConfirmClient } from './BookingConfirmClient';
import { Suspense } from 'react';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function BookingConfirmPage() {
  const settings = await getSiteSettings();

  return (
    <PageContainer className="!py-0 !space-y-0">
      <Section containerClassName="mx-auto w-full max-w-3xl pt-12 pb-24">
        <h1 className="mb-10 text-center text-3xl font-black text-slate-800 md:text-5xl">تأكيد ومراجعة الحجز</h1>
        <Card accentColor="emerald" className="p-6 md:p-10 shadow-xl shadow-slate-200/50">
          <Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
            <BookingConfirmClient
              paymentWalletNumber={settings.paymentWalletNumber}
              paymentQrUrl={settings.paymentQrUrl}
            />
          </Suspense>
        </Card>
      </Section>
    </PageContainer>
  );
}
