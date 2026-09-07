import Image from 'next/image';
import { getPersonalizedProducts } from '@/data/mock';
import { BookOpen, Book, FileText, ShoppingCart } from 'lucide-react';
import { SectionSubNav } from '@/components/SectionSubNav';
import { PageContainer } from '@/components/PageContainer';
import { SectionHeader } from '@/components/SectionHeader';

const enhaLakTabs = [
  { name: 'نظرة عامة', href: '/enha-lak' },
  { name: 'أنت البطل هنا', href: '/enha-lak/custom' },
  { name: 'المكتبة العامة', href: '/enha-lak/library' },
  { name: 'صندوق الرحلة', href: '/enha-lak/subscription' },
];

export default async function LibraryPage() {
  const allProducts = await getPersonalizedProducts();
  const libraryProducts = allProducts.filter((p) => p.category === 'library');

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="المكتبة العامة"
        icon={<BookOpen className="h-8 w-8" />}
        iconClassName="bg-emerald-50 text-emerald-600"
        subNav={
          <SectionSubNav
            tabs={enhaLakTabs}
            activeColorClass="bg-rose-500 text-white"
          />
        }
        description="اختر قصة جاهزة من المكتبة وخصص غلافها فقط، محتوى القصة الأصلي يبقى كما هو. خيار مثالي لمن يبحث عن محتوى قيم بلمسة شخصية بسيطة."
      />

      {/* Library Products */}
      <section className="mx-auto w-full max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {libraryProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-xl"
            >
              <div className="relative h-56 w-full bg-slate-100">
                <Image
                  src={
                    product.coverImageUrl ||
                    `https://picsum.photos/seed/${product.id}/600/800`
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-2 text-xl font-bold text-slate-800">
                  {product.name}
                </h3>
                <p className="mb-6 flex-1 text-sm font-medium text-slate-500">
                  {product.shortDescription}
                </p>

                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">
                        مطبوعة
                      </span>
                    </div>
                    <span className="font-black text-emerald-600">
                      {product.price.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                  {product.electronicPrice && (
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">
                          إلكترونية
                        </span>
                      </div>
                      <span className="font-black text-emerald-600">
                        {product.electronicPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                  )}
                </div>

                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800">
                  <ShoppingCart className="h-4 w-4" />
                  اطلب الآن
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
