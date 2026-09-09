import Link from 'next/link';
import Image from 'next/image';
import { HeroCarousel } from '@/components/HeroCarousel';
import { getTestimonials } from '@/data/mock';
import { Quote } from 'lucide-react';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'منصة الرحلة - الصفحة الرئيسية',
  description: 'المنصة الرائدة لتعليم وتعزيز مهارات الكتابة الإبداعية وتنمية الخيال.',
};



const homeSlides = [
  {
    id: '1',
    title: 'رحلتان مختلفتان... ومساحة واحدة للحكاية والنمو',
    description: '«الرحلة» منصة عربية أسرية تجمع مشروعين: «إنها لك» و«بداية الرحلة».',
    image: 'https://picsum.photos/seed/magicbook/1600/900',
    ctaText: 'ابدأ الرحلة',
    ctaLink: '/about',
    theme: 'amber' as const,
  },
  {
    id: '2',
    title: 'إنها لك: حيث يتحول الخيال إلى واقع',
    description: 'قصص ومنتجات مخصصة تجعل الطفل جزءًا من الحكاية، وتجعل الأسرة شريكةً.',
    image: 'https://picsum.photos/seed/kidsstory/1600/900',
    ctaText: 'استكشف إنها لك',
    ctaLink: '/enha-lak',
    theme: 'violet' as const,
  },
  {
    id: '3',
    title: 'أكاديمية بداية الرحلة',
    description: 'برنامج فردي للكتابة الإبداعية يساعد الشباب والأطفال على اكتشاف أصواتهم الخاصة.',
    image: 'https://picsum.photos/seed/childwriting/1600/900',
    ctaText: 'تعرف على الأكاديمية',
    ctaLink: '/creative-writing',
    theme: 'emerald' as const,
  }
];

export default async function HomePage() {
  const testimonials = await getTestimonials();

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-start space-y-32 px-6 py-12 font-sans text-slate-800 md:px-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "الرحلة",
  "description": "منصة مخصصة لقصص الأطفال وبرامج الكتابة الإبداعية",
  "url": "https://www.enhalak.com"
}) }} />
      
      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl pt-8 pb-12 w-full">
        <HeroCarousel slides={homeSlides} />
      </section>


      {/* Choose Your Journey */}
      <section className="mx-auto w-full max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          اختر رحلتك
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <Link
            href="/enha-lak"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white transition-all duration-300 hover:border-violet-300 hover:shadow-2xl hover:shadow-violet-500/10"
          >
            <div className="relative h-64 w-full overflow-hidden bg-slate-100">
              <Image 
                src="https://picsum.photos/seed/kidsstory/800/600" 
                alt="إنها لك" 
                fill className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="relative flex flex-1 flex-col p-8">
              <div className="absolute top-0 right-0 -z-0 h-32 w-32 rounded-bl-full bg-violet-50 transition-transform group-hover:scale-110"></div>
              <h3 className="relative z-10 mb-4 text-2xl font-bold text-violet-700">
                إنها لك
              </h3>
              <p className="relative z-10 leading-relaxed font-medium text-slate-600">
                قصص ومنتجات مخصصة تجعل الطفل جزءًا من الحكاية، وتجعل الأسرة شريكةً
                في اختيار الفكرة أو القيمة التي تُنسج حولها.
              </p>
            </div>
          </Link>
          <Link
            href="/creative-writing"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white transition-all duration-300 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10"
          >
            <div className="relative h-64 w-full overflow-hidden bg-slate-100">
              <Image 
                src="https://picsum.photos/seed/childwriting/800/600" 
                alt="بداية الرحلة" 
                fill className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="relative flex flex-1 flex-col p-8">
              <div className="absolute top-0 right-0 -z-0 h-32 w-32 rounded-bl-full bg-emerald-50 transition-transform group-hover:scale-110"></div>
              <h3 className="relative z-10 mb-4 text-2xl font-bold text-emerald-600">
                بداية الرحلة
              </h3>
              <p className="relative z-10 leading-relaxed font-medium text-slate-600">
                برنامج فردي للكتابة الإبداعية يساعد الشباب والأطفال على اكتشاف
                أصواتهم الخاصة وتطوير مهاراتهم في السرد والتعبير.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
        <div className="grid lg:grid-cols-2">
          <div className="relative h-64 lg:h-auto">
            <Image 
              src="https://picsum.photos/seed/familyreading/800/800" 
              alt="العائلة تقرأ معاً" 
              fill className="object-cover" referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/90 lg:to-white"></div>
          </div>
          <div className="flex flex-col justify-center p-8 text-right md:p-12 lg:p-16">
            <h2 className="mb-8 text-3xl font-black text-slate-800">
              قصتنا: من فكرة إلى رحلة
            </h2>
            <div className="mb-8 space-y-4 text-lg leading-relaxed font-medium text-slate-600">
              <p>
                كيف نحوّل الكتابة لدى الطفل من واجب إلى هواية؟ وكيف نساعده على أن
                يعثر على صوته بين الكلمات؟ من هذه الرغبة وُلدت «بداية الرحلة»؛ مساحة
                آمنة تبدأ فيها الحكاية من الداخل.
              </p>
              <p>
                وفي الجهة الأخرى، وُلدت «إنها لك» من حكاية تبحث عن بطلها، لتصل إليه
                حاملةً اسمه وشيئًا منه. ومع الوقت، أدركنا أن الحكاية لا يحدّها عُمر،
                فاتسعت مسارات المشروعين.
              </p>
              <p>
                ولأن القصة هي نواتهما المشتركة — مرةً تصل إلى صاحبها، ومرةً تنطلق من
                صوته — جمعناهما تحت اسم يتسع لكل بداية: «الرحلة».
              </p>
            </div>
            <div>
              <Link
                href="/about"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-amber-400 hover:bg-amber-50"
              >
                تعرّف إلى رحلتنا
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          ماذا يقولون عنا؟
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <Quote className="mb-4 h-8 w-8 text-blue-200" />
                <p className="mb-6 leading-relaxed font-medium text-slate-600 italic">
                  "{testimonial.content}"
                </p>
              </div>
              <div>
                <div className="font-bold text-slate-800">
                  {testimonial.authorName}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">
                  {testimonial.authorRole}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="mx-auto w-full max-w-4xl text-center">
        <h2 className="mb-6 text-3xl font-black text-slate-800">
          مساحة للإلهام
        </h2>
        <p className="mx-auto mb-8 max-w-2xl font-medium text-slate-500">
          نشارككم في مدونتنا مقالات تربوية، نصائح لتطوير الكتابة، وأفكاراً
          لتعزيز حب القراءة لدى الأبناء.
        </p>
        <Link
          href="/blog"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800"
        >
          تصفح المدونة
        </Link>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-4xl pb-20 text-center">
        <h2 className="mb-10 text-4xl font-black text-slate-900">
          هل أنت مستعد لتبدأ الرحلة؟
        </h2>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/enha-lak"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 transition-colors hover:bg-blue-700"
          >
            استكشف قصص "إنها لك"
          </Link>
          <Link
            href="/creative-writing/booking"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-2xl bg-amber-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-amber-200 transition-colors hover:bg-amber-600"
          >
            احجز مقعداً في "بداية الرحلة"
          </Link>
        </div>
      </section>
    </div>
  );
}
