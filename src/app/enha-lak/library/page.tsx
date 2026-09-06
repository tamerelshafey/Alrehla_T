import Image from 'next/image';
import { getPersonalizedProducts } from '@/data/mock';
import { BookOpen, Book, FileText, ShoppingCart } from 'lucide-react';

export default async function LibraryPage() {
  const allProducts = await getPersonalizedProducts();
  const libraryProducts = allProducts.filter(p => p.category === 'library');

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Header */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
          المكتبة العامة
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          اختر قصة جاهزة من المكتبة وخصص غلافها فقط، محتوى القصة الأصلي يبقى كما هو. خيار مثالي لمن يبحث عن محتوى قيم بلمسة شخصية بسيطة.
        </p>
      </section>

      {/* Library Products */}
      <section className="w-full max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {libraryProducts.map((product) => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col">
              <div className="relative h-56 w-full bg-slate-100">
                <Image
                  src={product.coverImageUrl || `https://picsum.photos/seed/${product.id}/600/800`}
                  alt={product.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{product.name}</h3>
                <p className="text-slate-500 text-sm font-medium mb-6 flex-1">{product.shortDescription}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">مطبوعة</span>
                    </div>
                    <span className="font-black text-emerald-600">{product.price.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  {product.electronicPrice && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">إلكترونية</span>
                      </div>
                      <span className="font-black text-emerald-600">{product.electronicPrice.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  )}
                </div>

                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
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
