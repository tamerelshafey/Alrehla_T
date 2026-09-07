import Image from 'next/image';
import { getPersonalizedProducts, getAddonProducts } from '@/data/mock';
import { PenTool, Plus, Book, FileText, ShoppingCart } from 'lucide-react';
import { SectionSubNav } from '@/components/SectionSubNav';

const enhaLakTabs = [
  { name: 'نظرة عامة', href: '/enha-lak' },
  { name: 'أنت البطل هنا', href: '/enha-lak/custom' },
  { name: 'المكتبة العامة', href: '/enha-lak/library' },
  { name: 'صندوق الرحلة', href: '/enha-lak/subscription' },
];


export default async function CustomPage() {
  const allProducts = await getPersonalizedProducts();
  const customProducts = allProducts.filter((p) => p.category === 'custom');
  const addons = await getAddonProducts();

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-start space-y-24 px-6 py-20 font-sans text-slate-800 md:px-12">
      {/* Header */}
      <section className="mx-auto max-w-4xl space-y-6 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <PenTool className="h-8 w-8" />
        </div>
        <h1 className="text-4xl leading-tight font-black text-slate-900 md:text-5xl">
          أنت البطل هنا
        </h1>
        <SectionSubNav tabs={enhaLakTabs} activeColorClass="bg-rose-500 text-white" />
        <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
          نصنع محتوى مخصصاً لطفلك من الصفر بعد إتمام الطلب، ليكون هو محور القصة
          بأدق تفاصيلها.
        </p>
      </section>

      {/* Custom Products */}
      <section className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          {customProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="relative h-64 w-full bg-slate-100">
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
                    <span className="font-black text-blue-600">
                      {product.price.toLocaleString('ar-EG')} ج.م
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
                      <span className="font-black text-blue-600">
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

      {/* Addons */}
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-100 bg-slate-50/50 p-8 md:p-12">
        <div className="mb-10 text-center">
          <h2 className="flex items-center justify-center gap-3 text-3xl font-black text-slate-800">
            <Plus className="h-8 w-8 text-amber-500" />
            إضافات اختيارية
          </h2>
          <p className="mt-4 font-medium text-slate-500">
            اجعل تجربة طفلك أكثر متعة وتفاعلاً مع هذه الإضافات الممتعة.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {addons.map((addon) => (
            <div
              key={addon.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
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
                <span className="text-lg font-black text-amber-600">
                  {addon.price.toLocaleString('ar-EG')} ج.م
                </span>
                <button className="text-sm font-bold text-blue-600 hover:text-blue-800">
                  إضافة للطلب
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
