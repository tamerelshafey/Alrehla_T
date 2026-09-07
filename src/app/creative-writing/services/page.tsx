import Link from 'next/link';
import { getCreativeServices } from '@/data/mock';
import { ArrowLeft } from 'lucide-react';
import { SectionSubNav } from '@/components/SectionSubNav';

const creativeWritingTabs = [
  { name: 'نظرة عامة', href: '/creative-writing' },
  { name: 'عن البرنامج', href: '/creative-writing/about' },
  { name: 'الباقات', href: '/creative-writing/packages' },
  { name: 'المدربون', href: '/creative-writing/instructors' },
  { name: 'الخدمات الإبداعية', href: '/creative-writing/services' },
];


export default async function ServicesPage() {
  const services = await getCreativeServices();

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-start space-y-24 px-6 py-20 font-sans text-slate-800 md:px-12">
      {/* Header */}
      <section className="mx-auto max-w-4xl space-y-6 text-center">
        <h1 className="text-4xl leading-tight font-black text-slate-900 md:text-5xl">
          الخدمات الإبداعية المستقلة
        </h1>
        <SectionSubNav tabs={creativeWritingTabs} activeColorClass="bg-sky-600 text-white" />
        <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
          خدمات فردية وسريعة لتطوير مهارات الكتابة، ومراجعة النصوص، وتوليد
          الأفكار، دون الالتزام ببرنامج طويل.
        </p>
      </section>

      {/* Services Grid */}
      <section className="mx-auto w-full max-w-5xl">
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="mb-6 flex flex-col">
                <h3 className="mb-2 text-2xl font-black text-slate-800">
                  {service.name}
                </h3>
                <div className="text-lg font-black text-blue-600">
                  {service.price.toLocaleString('ar-EG')} ج.م
                </div>
              </div>
              <p className="mb-8 flex-1 text-sm leading-relaxed font-medium text-slate-600">
                {service.description}
              </p>
              <Link
                href="/creative-writing/booking"
                className="mt-auto w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800"
              >
                احجز الآن
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Packages Link */}
      <div className="mx-auto mt-12 w-full max-w-4xl rounded-3xl border border-slate-100 bg-slate-50 p-8 text-center">
        <h3 className="mb-4 text-xl font-bold text-slate-800">
          تبحث عن مسار متكامل بدل خدمة واحدة؟
        </h3>
        <Link
          href="/creative-writing/packages"
          className="inline-flex items-center gap-2 text-lg font-bold text-amber-600 transition-all hover:gap-3"
        >
          استعرض الباقات <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
