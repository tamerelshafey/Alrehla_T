import { getProductBySlug } from '@/data/mock';
import { PageContainer } from '@/components/PageContainer';
import Link from 'next/link';
import { PersonalizationWizard } from '@/components/enha-lak/PersonalizationWizard';

export default async function CustomProductPage({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params;
  const product = await getProductBySlug(productSlug);

  if (!product || product.ownerType !== 'platform') {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-3xl font-black text-slate-800">المنتج غير متاح للتخصيص</h1>
          <Link href="/enha-lak" className="mt-8 rounded-xl bg-rose-500 px-6 py-3 font-bold text-white hover:bg-rose-600 transition-colors">
            العودة للمتجر
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PersonalizationWizard product={product} />
    </div>
  );
}
