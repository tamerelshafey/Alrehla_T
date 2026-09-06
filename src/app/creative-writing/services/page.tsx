import Link from 'next/link';
import { getCreativeServices } from '@/data/mock';
import { ArrowLeft } from 'lucide-react';

export default async function ServicesPage() {
  const services = await getCreativeServices();

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Header */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
          الخدمات الإبداعية المستقلة
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          خدمات فردية وسريعة لتطوير مهارات الكتابة، ومراجعة النصوص، وتوليد الأفكار، دون الالتزام ببرنامج طويل.
        </p>
      </section>

      {/* Services Grid */}
      <section className="w-full max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
              <div className="flex flex-col mb-6">
                <h3 className="text-2xl font-black text-slate-800 mb-2">{service.name}</h3>
                <div className="text-blue-600 font-black text-lg">
                  {service.price.toLocaleString('ar-EG')} ج.م
                </div>
              </div>
              <p className="text-slate-600 font-medium text-sm leading-relaxed mb-8 flex-1">
                {service.description}
              </p>
              <Link href="/creative-writing/booking" className="w-full py-3 text-center bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-colors mt-auto">
                احجز الآن
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Packages Link */}
      <div className="w-full max-w-4xl mx-auto text-center mt-12 bg-slate-50 border border-slate-100 p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-slate-800 mb-4">تبحث عن مسار متكامل بدل خدمة واحدة؟</h3>
        <Link href="/creative-writing/packages" className="inline-flex items-center gap-2 text-amber-600 font-bold hover:gap-3 transition-all text-lg">
          استعرض الباقات <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

    </div>
  );
}
