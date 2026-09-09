import { getProductBySlug } from '@/data/mock';
import { PageContainer } from '@/components/PageContainer';
import Image from 'next/image';
import Link from 'next/link';
import { AddToCartButton } from '@/components/cart/AddToCartButton';


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'منتج غير موجود' };
  return { title: product.name, description: product.shortDescription };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-3xl font-black text-slate-800">المنتج غير موجود</h1>
          <p className="mt-4 text-slate-500">عذراً، المنتج الذي تبحث عنه غير متاح أو لا يمتلك صفحة تفصيلية مستقلة.</p>
          <Link href="/enha-lak" className="mt-8 rounded-xl bg-rose-500 px-6 py-3 font-bold text-white hover:bg-rose-600 transition-colors">
            العودة للمتجر
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.shortDescription,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "EGP"
    }
  }) }} />
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-lg">
          {product.coverImageUrl ? (
            <Image
              src={product.coverImageUrl}
              alt={product.name}
              fill priority
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              لا توجد صورة
            </div>
          )}
        </div>
        
        <div className="flex flex-col justify-center space-y-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight">{product.name}</h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">{product.shortDescription}</p>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800">ميزات المنتج:</h3>
              <ul className="space-y-2">
                {product.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-600">
                    <svg className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-black text-rose-500">{product.price} ج.م</span>
              {product.electronicPrice && (
                <span className="text-sm font-bold text-slate-500 line-through">
                  بدلاً من {product.price + 5000} ج.م
                </span>
              )}
            </div>
            
            <div className="mt-6">
              {product.ownerType === 'platform' ? (
                <Link 
                  href={`/enha-lak/custom/${product.slug}`}
                  className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-4 font-bold text-white transition-colors hover:bg-slate-800"
                >
                  ابدأ التخصيص
                </Link>
              ) : product.category === 'library' ? (
                <Link 
                  href={`/enha-lak/custom-library/${product.slug}`}
                  className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white transition-colors hover:bg-emerald-700"
                >
                  تخصيص الغلاف وإضافة للسلة
                </Link>
              ) : (
                <AddToCartButton 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    type: 'custom',
                    imageUrl: product.coverImageUrl || `https://picsum.photos/seed/${product.id}/600/800`
                  }} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
