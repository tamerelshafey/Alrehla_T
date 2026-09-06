import Link from 'next/link';
import { getTestimonials } from '@/data/mock';
import { Quote } from 'lucide-react';

export default async function HomePage() {
  const testimonials = await getTestimonials();

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-start space-y-32 px-6 py-12 font-sans text-slate-800 md:px-12">
      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-4xl space-y-6 pt-20 text-center">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/40 blur-[100px] sm:h-[400px] sm:w-[600px] md:w-[800px] md:blur-[120px]"></div>
        <h1 className="relative z-10 text-5xl leading-tight font-black tracking-tight text-slate-900 drop-shadow-sm sm:text-6xl md:text-7xl">
          رحلتان مختلفتان... ومساحة واحدة للحكاية والنمو
        </h1>
        <p className="relative z-10 mx-auto max-w-3xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
          «الرحلة» منصة عربية أسرية تجمع مشروعين: «إنها لك» يقدّم قصصًا مصورة
          هادفة تُخصَّص لأبنائكم ليكونوا هم أبطالها، و«بداية الرحلة» برنامج فردي
          للكتابة يساعدهم على اكتشاف أصواتهم وتنمية أدواتهم الكتابية.
        </p>
      </section>

      {/* Choose Your Journey */}
      <section className="mx-auto w-full max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          اختر رحلتك
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <Link
            href="/enha-lak"
            className="group relative block overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="absolute top-0 right-0 -z-0 h-32 w-32 rounded-bl-full bg-blue-50 transition-transform group-hover:scale-110"></div>
            <h3 className="relative z-10 mb-4 text-2xl font-bold text-blue-700">
              إنها لك
            </h3>
            <p className="relative z-10 leading-relaxed font-medium text-slate-600">
              قصص ومنتجات مخصصة تجعل الطفل جزءًا من الحكاية، وتجعل الأسرة شريكةً
              في اختيار الفكرة أو القيمة التي تُنسج حولها.
            </p>
          </Link>
          <Link
            href="/creative-writing"
            className="group relative block overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/10"
          >
            <div className="absolute top-0 right-0 -z-0 h-32 w-32 rounded-bl-full bg-amber-50 transition-transform group-hover:scale-110"></div>
            <h3 className="relative z-10 mb-4 text-2xl font-bold text-amber-600">
              بداية الرحلة
            </h3>
            <p className="relative z-10 leading-relaxed font-medium text-slate-600">
              برنامج فردي للكتابة الإبداعية يساعد الشباب والأطفال على اكتشاف
              أصواتهم الخاصة وتطوير مهاراتهم في السرد والتعبير.
            </p>
          </Link>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-center md:p-12">
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
        <Link
          href="/about"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          تعرّف إلى رحلتنا
        </Link>
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
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800"
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
            className="rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 transition-colors hover:bg-blue-700"
          >
            استكشف قصص "إنها لك"
          </Link>
          <Link
            href="/creative-writing/booking"
            className="rounded-2xl bg-amber-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-amber-200 transition-colors hover:bg-amber-600"
          >
            احجز مقعداً في "بداية الرحلة"
          </Link>
        </div>
      </section>
    </div>
  );
}
