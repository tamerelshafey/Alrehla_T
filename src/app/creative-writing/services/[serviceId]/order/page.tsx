import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

// صفحة داخل مسار الشراء: مالهاش لازمة في نتايج البحث، والرابط القانوني
// بيوجّه للصفحة العامة اللي المفروض تتفهرس.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'طلب خدمة إبداعية',
    description: 'إتمام طلب خدمة إبداعية مع المدرب الذي اخترته.',
    path: '/creative-writing/services',
    noIndex: true,
  });
}

import { getSiteSettings } from '@/data/domains/content';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/PageContainer';
import { Section } from '@/components/ui/Section';
import { getStandaloneServices, getProvidersForService } from '@/data/domains/services';
import { getCurrentUser } from '@/data/domains/auth';
import { OrderServiceClient } from './OrderServiceClient';

export const dynamic = 'force-dynamic';

export default async function OrderServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<{ instructor?: string }>;
}) {
  const { serviceId } = await params;
  const { instructor: instructorId } = await searchParams;

  const settings = await getSiteSettings();
  const services = await getStandaloneServices();
  const service = services.find((s) => s.id === serviceId);
  if (!service) notFound();

  const user = await getCurrentUser();
  if (user.role === 'visitor') {
    redirect('/sign-in');
  }

  // The price shown must be the one the server will actually charge, so it is
  // resolved here from the same source the order action uses.
  let amount = service.price;
  let instructorName: string | null = null;

  if (service.priceType === 'starts_from') {
    if (!instructorId) {
      redirect(`/creative-writing/services/${serviceId}`);
    }
    const providers = await getProvidersForService(serviceId);
    const provider = providers.find((p) => p.instructorId === instructorId);
    if (!provider) {
      redirect(`/creative-writing/services/${serviceId}`);
    }
    amount = provider.price;
    instructorName = provider.displayName;
  }

  return (
    <PageContainer>
      <Section containerClassName="mx-auto w-full max-w-2xl pt-16 pb-24">
        <Link
          href={
            service.priceType === 'starts_from'
              ? `/creative-writing/services/${serviceId}`
              : '/creative-writing/services'
          }
          className="mb-8 inline-flex items-center gap-2 font-bold text-slate-500 transition-colors hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4 rotate-180" />
          رجوع
        </Link>

        <h1 className="mb-8 text-3xl font-black tracking-tight text-slate-900">تأكيد الطلب</h1>

        <OrderServiceClient
          paymentWalletNumber={settings.paymentWalletNumber}
          paymentQrUrl={settings.paymentQrUrl}
          serviceId={serviceId}
          serviceName={service.name}
          instructorId={instructorId ?? null}
          instructorName={instructorName}
          amount={amount}
        />
      </Section>
    </PageContainer>
  );
}
