import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

// صفحة داخل مسار الشراء: مالهاش لازمة في نتايج البحث، والرابط القانوني
// بيوجّه للصفحة العامة اللي المفروض تتفهرس.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'تخصيص القصة',
    description: 'أدخل بيانات طفلك لتخصيص القصة قبل إتمام الطلب.',
    path: '/enha-lak/custom',
    noIndex: true,
  });
}

import { getProductBySlug, getAddonProducts } from '@/data/domains/products';
import { PageContainer } from '@/components/PageContainer';
import Link from 'next/link';
import { PersonalizationWizard } from '@/components/enha-lak/PersonalizationWizard';

export default async function CustomProductPage({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params;
  const [product, addons] = await Promise.all([
    getProductBySlug(productSlug),
    getAddonProducts(),
  ]);

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
      <PersonalizationWizard product={product} addons={addons} />
    </div>
  );
}
