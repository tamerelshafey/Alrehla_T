import Image from 'next/image';
import { getPersonalizedProducts, getAddonProducts } from '@/data/mock';
import { PenTool, Plus, Book, FileText, ShoppingCart } from 'lucide-react';

export default async function CustomPage() {
  const allProducts = await getPersonalizedProducts();
  const customProducts = allProducts.filter(p => p.category === 'custom');
  const addons = await getAddonProducts();

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Header */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
          <PenTool className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
          أنت البطل هنا
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          نصنع محتوى مخصصاً لطفلك من الصفر بعد إتمام الطلب، ليكون هو محور القصة بأدق تفاصيلها.
        </p>
      </section>

      {/* Custom Products */}
      <section className="w-full max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {customProducts.map((product) => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col">
              <div className="relative h-64 w-full bg-slate-100">
                <Image
                  src={product.coverImageUrl || `https://picsum.photos/seed/${product.id}/600/800`}
                  alt={product.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{product.name}</h3>
                <p className="text-slate-500 font-medium mb-6 flex-1">{product.shortDescription}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">نسخة مطبوعة</span>
                    </div>
                    <span className="font-black text-blue-600">{product.price.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  {product.electronicPrice && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">نسخة إلكترونية</span>
                      </div>
                      <span className="font-black text-blue-600">{product.electronicPrice.toLocaleString('ar-EG')} ج.م</span>
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

      {/* Addons */}
      <section className="w-full max-w-4xl mx-auto bg-slate-50/50 rounded-3xl p-8 md:p-12 border border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 flex items-center justify-center gap-3">
            <Plus className="w-8 h-8 text-amber-500" />
            إضافات اختيارية
          </h2>
          <p className="text-slate-500 font-medium mt-4">اجعل تجربة طفلك أكثر متعة وتفاعلاً مع هذه الإضافات الممتعة.</p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-6">
          {addons.map((addon) => (
            <div key={addon.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{addon.name}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">{addon.description}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                <span className="font-black text-amber-600 text-lg">{addon.price.toLocaleString('ar-EG')} ج.م</span>
                <button className="text-sm font-bold text-blue-600 hover:text-blue-800">إضافة للطلب</button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
