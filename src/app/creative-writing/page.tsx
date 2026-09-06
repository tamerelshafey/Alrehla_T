import Link from 'next/link';
import { getTestimonials } from '@/data/mock';
import { PenTool, Target, Map, ShieldCheck, Heart, Sparkles, User, ArrowLeft, Quote } from 'lucide-react';

export default async function CreativeWritingPage() {
  const allTestimonials = await getTestimonials();
  // Filter for specific testimonials if possible, or just use them
  const testimonials = allTestimonials.filter(t => t.authorRole.includes('ولي'));

  const suitableFor = [
    { text: 'لديه أفكار أو صور أو قصص، ويريد أدوات تساعده على تحويلها إلى كتابة أوضح.', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' },
    { text: 'قد لا يعرف من أين يبدأ، أو يتوقف طويلاً أمام الصفحة البيضاء، ويحتاج إلى مساحة تساعده على المحاولة.', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { text: 'لديه نصوص أو محاولات ويريد تطوير الفكرة والصياغة والمراجعة مع الحفاظ على صوته.', icon: PenTool, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const features = [
    { title: 'مساحة للمحاولة', description: 'يبدأ من نقطة تناسبه، من غير مقارنة أو قالب واحد للجميع.', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'أدوات للكتابة', description: 'يتعرف إلى أدوات تساعده على تنمية الفكرة والوصف والتنظيم والمراجعة.', icon: PenTool, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'صوت واختيار', description: 'الفكرة والقرارات الأساسية والنص لصاحبها.', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'تقدم بلا مقارنة', description: 'ينمو من خلال المحاولة والتغذية الراجعة والمراجعة، لا الدرجات.', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-32">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-widest border border-amber-100">
          مشروع بداية الرحلة
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
          رحلة كتابة، لا درس كتابة
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto mb-10">
          برنامج كتابة فردي عبر الإنترنت لأعمار 6–20، يساعد المشارك على تنمية أدواته وصوته في الكتابة.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/creative-writing/packages" className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-amber-200 hover:bg-amber-600 transition-colors">
            استعرض الباقات
          </Link>
          <Link href="/creative-writing/services" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors">
            الخدمات الإبداعية المستقلة
          </Link>
        </div>
      </section>

      {/* Suitable For */}
      <section className="w-full max-w-6xl mx-auto bg-slate-50/50 rounded-3xl p-8 md:p-16 border border-slate-100">
        <h2 className="text-3xl font-black text-center mb-12 text-slate-800">قد تكون مناسبة إذا كان المشارك...</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {suitableFor.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${item.bg} ${item.color} mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>
                <p className="text-slate-600 font-medium leading-relaxed text-lg">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-16 text-slate-800">ماذا يجد المشارك في «بداية الرحلة»؟</h2>
        <div className="grid sm:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex gap-6 items-start">
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${feature.bg} ${feature.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pathways */}
      <section className="w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12 text-slate-800">ما يناسبك؟</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/creative-writing/packages" className="group block bg-white border border-slate-200 rounded-3xl p-8 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">باقات «بداية الرحلة»</h3>
            <p className="text-slate-600 font-medium mb-6">لمن يريد مسارًا متتابعًا</p>
            <span className="text-amber-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
              اكتشف الباقات <ArrowLeft className="w-4 h-4" />
            </span>
          </Link>
          <Link href="/creative-writing/services" className="group block bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <PenTool className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">خدمات إبداعية مستقلة</h3>
            <p className="text-slate-600 font-medium mb-6">مراجعات واستشارات سريعة</p>
            <span className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
              اكتشف الخدمات <ArrowLeft className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* Instructors Teaser */}
      <section className="w-full max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-slate-800 text-slate-300 rounded-2xl flex items-center justify-center mb-6">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black mb-6">مدربو «بداية الرحلة»</h2>
          <p className="text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-8">
            فريق من الكُتّاب والتربويين المتخصصين في أدب الطفل واليافعين، يجمعون بين الشغف الإبداعي والقدرة على التوجيه بأسلوب داعم ومحفز.
          </p>
          <Link href="/creative-writing/instructors" className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors">
            تعرّف إلى المدربين
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.slice(0, 2).map((testimonial) => (
            <div key={testimonial.id} className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <Quote className="w-10 h-10 text-amber-200 mb-6" />
                <p className="text-slate-700 font-medium leading-relaxed italic mb-8 text-lg">"{testimonial.content}"</p>
              </div>
              <div>
                <div className="font-bold text-slate-900">{testimonial.authorName}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">{testimonial.authorRole}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full max-w-4xl mx-auto text-center pb-20">
        <h2 className="text-4xl font-black mb-10 text-slate-900">جاهز للبدء؟</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/creative-writing/packages" className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-amber-200 hover:bg-amber-600 transition-colors">
            استعرض الباقات
          </Link>
          <Link href="/creative-writing/services" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors">
            اختر خدمة مستقلة
          </Link>
        </div>
      </section>
    </div>
  );
}
