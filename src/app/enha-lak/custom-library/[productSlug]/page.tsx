import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/data/mock';
import { PageContainer } from '@/components/PageContainer';
import { Section } from '@/components/ui/Section';
import { LibraryCustomizationWizard } from '@/components/enha-lak/LibraryCustomizationWizard';

interface PageProps {
  params: Promise<{ productSlug: string }>;
}

export default async function CustomLibraryPage({ params }: PageProps) {
  const { productSlug } = await params;
  const product = await getProductBySlug(productSlug);

  if (!product || product.category !== 'library') {
    notFound();
  }

  return (
    <PageContainer className="!py-0 !space-y-0">
      <Section>
        <LibraryCustomizationWizard product={product} />
      </Section>
    </PageContainer>
  );
}
