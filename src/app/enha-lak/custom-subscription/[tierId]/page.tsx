import { notFound } from 'next/navigation';
import { getSubscriptionTiers } from '@/data/mock';
import { PageContainer } from '@/components/PageContainer';
import { Section } from '@/components/ui/Section';
import { PersonalizationWizard } from '@/components/enha-lak/PersonalizationWizard';
import { PersonalizedProduct } from '@/types';

interface PageProps {
  params: Promise<{ tierId: string }>;
}

export default async function CustomSubscriptionPage({ params }: PageProps) {
  const { tierId } = await params;
  const tiers = await getSubscriptionTiers();
  const tier = tiers.find(t => t.id === tierId);

  if (!tier) {
    notFound();
  }

  const product: PersonalizedProduct = {
    id: tier.id,
    slug: tier.id,
    name: `صندوق الرحلة - ${tier.name}`,
    category: 'subscription',
    price: tier.priceTotal,
    shortDescription: `اشتراك صندوق الرحلة (لمدة ${tier.durationMonths} ${tier.durationMonths === 1 ? 'شهر' : 'أشهر'})`,
    ownerType: 'platform',
    coverImageUrl: `https://picsum.photos/seed/${tier.id}/600/800`,
    features: [
      'قصة مخصصة جديدة شهرياً',
      'أنشطة تفاعلية ومفاجآت',
      'تخصيص كامل للشخصية والهدف التربوي'
    ]
  };

  return (
    <PageContainer className="!py-0 !space-y-0">
      <Section>
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-black text-rose-700">تخصيص صندوق الرحلة</h1>
          <p className="mt-2 text-slate-600">قم بإعداد تفاصيل البطل للاشتراك ({tier.name})</p>
        </div>
        <PersonalizationWizard product={product} />
      </Section>
    </PageContainer>
  );
}
