import Link from 'next/link';
import { getTestimonials } from '@/data/mock';
import { Quote } from 'lucide-react';

export default async function HomePage() {
  const testimonials = await getTestimonials();

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-12 w-full font-sans text-slate-800 space-y-32">
      {/* Hero Section */}
      <section className="relative z-10 text-center space-y-6 max-w-4xl mx-auto pt-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[400px] bg-blue-100/30 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight text-slate-900 drop-shadow-sm relative z-10">
          رحلةٌ تُكتب باسمه، ورحلةٌ يكتبها بصوته.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed relative z-10">
          «الرحلة» منصة عربية أسرية تجمع مشروعين: «إنها لك» يقدّم قصصًا مصورة هادفة تُخصَّص لأبنائكم ليكونوا هم أبطالها، و«بداية الرحلة» برنامج فردي للكتابة يساعدهم على اكتشاف أصواتهم وتنمية أدواتهم الكتابية.
        </p>
      </section>

      {/* Choose Your Journey */}
      <section className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12 text-slate-800">اختر رحلتك</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Link href="/enha-lak" className="group block bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
            <h3 className="text-2xl font-bold text-blue-700 mb-4 relative z-10">إنها لك</h3>
            <p className="text-slate-600 font-medium leading-relaxed relative z-10">
              قصص ومنتجات مخصصة تجعل الطفل جزءًا من الحكاية، وتجعل الأسرة شريكةً في اختيار الفكرة أو القيمة التي تُنسج حولها.
            </p>
          </Link>
          <Link href="/creative-writing" className="group block bg-white border border-slate-200 rounded-3xl p-8 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
            <h3 className="text-2xl font-bold text-amber-600 mb-4 relative z-10">بداية الرحلة</h3>
            <p className="text-slate-600 font-medium leading-relaxed relative z-10">
              برنامج فردي للكتابة الإبداعية يساعد الشباب والأطفال على اكتشاف أصواتهم الخاصة وتطوير مهاراتهم في السرد والتعبير.
            </p>
          </Link>
        </div>
      </section>

      {/* Our Story */}
      <section className="w-full max-w-4xl mx-auto text-center bg-slate-50/50 rounded-3xl p-8 md:p-12 border border-slate-100">
        <h2 className="text-3xl font-black mb-8 text-slate-800">قصتنا: من فكرة إلى رحلة</h2>
        <div className="text-slate-600 font-medium leading-relaxed space-y-4 mb-8 text-lg">
          <p>
            كيف نحوّل الكتابة لدى الطفل من واجب إلى هواية؟ وكيف نساعده على أن يعثر على صوته بين الكلمات؟ من هذه الرغبة وُلدت «بداية الرحلة»؛ مساحة آمنة تبدأ فيها الحكاية من الداخل.
          </p>
          <p>
            وفي الجهة الأخرى، وُلدت «إنها لك» من حكاية تبحث عن بطلها، لتصل إليه حاملةً اسمه وشيئًا منه. ومع الوقت، أدركنا أن الحكاية لا يحدّها عُمر، فاتسعت مسارات المشروعين.
          </p>
          <p>
            ولأن القصة هي نواتهما المشتركة — مرةً تصل إلى صاحبها، ومرةً تنطلق من صوته — جمعناهما تحت اسم يتسع لكل بداية: «الرحلة».
          </p>
        </div>
        <Link href="/about" className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
          تعرّف إلى رحلتنا
        </Link>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12 text-slate-800">ماذا يقولون عنا؟</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-slate-600 font-medium leading-relaxed italic mb-6">"{testimonial.content}"</p>
              </div>
              <div>
                <div className="font-bold text-slate-800">{testimonial.authorName}</div>
                <div className="text-xs text-slate-500 font-medium mt-1">{testimonial.authorRole}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="w-full max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-black mb-6 text-slate-800">مساحة للإلهام</h2>
        <p className="text-slate-500 font-medium mb-8 max-w-2xl mx-auto">
          نشارككم في مدونتنا مقالات تربوية، نصائح لتطوير الكتابة، وأفكاراً لتعزيز حب القراءة لدى الأبناء.
        </p>
        <Link href="/blog" className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-colors">
          تصفح المدونة
        </Link>
      </section>

      {/* Final CTA */}
      <section className="w-full max-w-4xl mx-auto text-center pb-20">
        <h2 className="text-4xl font-black mb-10 text-slate-900">هل أنت مستعد لتبدأ الرحلة؟</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/enha-lak" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-colors">
            استكشف قصص "إنها لك"
          </Link>
          <Link href="/creative-writing/booking" className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-amber-200 hover:bg-amber-600 transition-colors">
            احجز مقعداً في "بداية الرحلة"
          </Link>
        </div>
      </section>
    </div>
  );
}
