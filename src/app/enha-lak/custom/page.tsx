import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'القصص المخصصة',
    description: 'اطلب قصة مخصصة يكون فيها طفلك هو البطل: اسمه وصورته واهتماماته داخل الحكاية.',
    path: '/enha-lak/custom',
  });
}

import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { optimizedImageUrl } from '@/lib/cloudinary';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import Link from 'next/link';
import { getAddonProducts, getPersonalizedProducts } from '@/data/domains/products';
import { PenTool, Plus, Book, FileText, ShoppingCart } from 'lucide-react';

import { PageContainer } from '@/components/PageContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function CustomPage() {
  const allProducts = await getPersonalizedProducts();
  const customProducts = allProducts.filter((p) => p.category === 'custom');
  const addons = await getAddonProducts();

  return (
    <PageContainer className="!py-0 !space-y-0">
      {/* Header */}
      <SectionHeader
        title="أنت البطل هنا"
        icon={<PenTool className="h-8 w-8" />}
        iconClassName="bg-rose-50 text-rose-600"
        description="نصنع محتوى مخصصاً لطفلك من الصفر بعد إتمام الطلب، ليكون هو محور القصة بأدق تفاصيلها."
      />

      {/* Custom Products */}
      <Section containerClassName="max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          {customProducts.map((product) => (
            <Card
              key={product.id}
              accentColor="rose"
              className="flex flex-col overflow-hidden relative p-0"
            >
              <div className="relative h-64 w-full bg-slate-100">
                {product.coverImageUrl ? (
                  <Image
                    src={optimizedImageUrl(product.coverImageUrl, 600)}
                    alt={product.name}
                    fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ImagePlaceholder label={product.name} />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-2 text-2xl font-bold text-slate-800">
                  {product.name}
                </h3>
                <p className="mb-6 flex-1 font-medium text-slate-500">
                  {product.shortDescription}
                </p>

                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">
                        نسخة مطبوعة
                      </span>
                    </div>
                    <span className="font-black text-rose-600">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  {product.electronicPrice && (
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">
                          نسخة إلكترونية
                        </span>
                      </div>
                      <span className="font-black text-rose-600">
                        {formatPrice(product.electronicPrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* كان هنا زرار «أضف للسلة» مباشر — والمنتجات دي مخصصة
                    بطبيعتها. يعني العميل كان يقدر يدفع تمن قصة بطلها
                    طفله من غير ما يدخل اسم الطفل ولا صورته ولا هواياته،
                    فيوصل للإدارة طلب **مستحيل تنفيذه**. الشراء دلوقتي
                    بيبدأ من التخصيص، والسلة بتتملى من آخر خطوة فيه. */}
                <Button
                  href={`/enha-lak/custom/${product.slug}`}
                  accentColor="rose"
                  className="w-full justify-center !bg-slate-900 !text-white hover:!bg-slate-800"
                >
                  ابدأ التخصيص
                </Button>
                <Button href={`/enha-lak/product/${product.slug}`} variant="secondary" className="mt-3 w-full">
                  عرض تفاصيل المنتج
                </Button>

              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Addons */}
      <Section containerClassName="max-w-4xl rounded-3xl border border-slate-100 bg-slate-50/50 p-8 md:p-12 pb-24">
        <div className="mb-10 text-center">
          <h2 className="flex items-center justify-center gap-3 text-3xl font-black text-slate-800">
            <Plus className="h-8 w-8 text-rose-500" />
            إضافات اختيارية
          </h2>
          <p className="mt-4 font-medium text-slate-500">
            اجعل تجربة طفلك أكثر متعة وتفاعلاً مع هذه الإضافات الممتعة.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {addons.map((addon) => (
            <Card
              key={addon.id}
              accentColor="rose"
              className="flex flex-col justify-between p-6 shadow-sm"
            >
              <div>
                <h3 className="mb-2 text-xl font-bold text-slate-800">
                  {addon.name}
                </h3>
                <p className="mb-4 text-sm leading-relaxed font-medium text-slate-500">
                  {addon.description}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-lg font-black text-rose-600">
                  {formatPrice(addon.price)}
                </span>
                <AddToCartButton 
                  product={{
                    id: addon.id,
                    productId: addon.id,
                    name: addon.name,
                    price: addon.price,
                    quantity: 1,
                    type: 'custom',
                  }} 
                  variant="outline"
                  className="w-auto px-4 py-2"
                />
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </PageContainer>
  );
}
