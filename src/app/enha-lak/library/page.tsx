import Image from 'next/image';
import { getPersonalizedProducts } from '@/data/mock';
import { BookOpen, Book, FileText, ShoppingCart } from 'lucide-react';

export default async function LibraryPage() {
  const allProducts = await getPersonalizedProducts();
  const libraryProducts = allProducts.filter((p) => p.category === 'library');

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-start space-y-24 px-6 py-20 font-sans text-slate-800 md:px-12">
      {/* Header */}
      <section className="mx-auto max-w-4xl space-y-6 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-4xl leading-tight font-black text-slate-900 md:text-5xl">
          المكتبة العامة
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
          اختر قصة جاهزة من المكتبة وخصص غلافها فقط، محتوى القصة الأصلي يبقى كما
          هو. خيار مثالي لمن يبحث عن محتوى قيم بلمسة شخصية بسيطة.
        </p>
      </section>

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
    </div>
  );
}
