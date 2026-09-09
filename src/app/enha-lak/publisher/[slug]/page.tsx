import { formatPrice } from '@/lib/utils';
import { getPublisherBySlug, getPersonalizedProducts } from '@/data/mock';
import { PageContainer } from '@/components/PageContainer';
import Image from 'next/image';
import { notFound } from 'next/navigation';


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const publisher = await getPublisherBySlug(slug);
  if (!publisher) return { title: 'ناشر غير موجود' };
  return { title: publisher.name, description: publisher.bio };
}

export default async function PublisherPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const publisher = await getPublisherBySlug(slug);

  if (!publisher) {
    notFound();
  }

  const allProducts = await getPersonalizedProducts();
  const publisherProducts = allProducts.filter(p => p.publisherId === publisher.id);

  return (
    <PageContainer>
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-right">
        {publisher.logoUrl && (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <Image
              src={publisher.logoUrl}
              alt={publisher.name}
              fill priority
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-black text-slate-900">{publisher.name}</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">{publisher.bio}</p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-black text-slate-900 mb-8 border-b-2 border-slate-100 pb-4 inline-block">إصدارات الناشر</h2>
        {publisherProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {publisherProducts.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                  {product.coverImageUrl ? (
                    <Image
                      src={product.coverImageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      لا توجد صورة
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-black text-rose-500">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">لا توجد إصدارات حالية لهذا الناشر.</p>
        )}
      </div>
    </PageContainer>
  );
}
