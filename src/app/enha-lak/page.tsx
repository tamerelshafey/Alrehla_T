import Link from 'next/link';
import { getTestimonials } from '@/data/mock';
import { Fingerprint, BookOpen, PenTool, Sparkles, User, FileEdit, Wand2, Package, Quote } from 'lucide-react';

export default async function EnhaLakPage() {
  const testimonials = await getTestimonials();
  
  const benefits = [
    { title: 'تعزيز الهوية', description: 'عندما يرى الطفل نفسه بطلاً، يزداد تقديره لذاته وثقته بنفسه.', icon: Fingerprint, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'شغف القراءة', description: 'الارتباط الشخصي بالقصة يحول القراءة من واجب إلى متعة.', icon: BookOpen, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'غرس القيم', description: 'الرسائل التربوية أكثر تأثيراً عندما يعيشها الطفل بنفسه.', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const steps = [
    { title: 'املأ البيانات', description: 'اسم الطفل، عمره، صورته، هواياته.', icon: User },
    { title: 'اختر القيمة', description: 'حدد الهدف التربوي.', icon: FileEdit },
    { title: 'انتظر السحر', description: 'فريقنا ينسج قصة مخصصة.', icon: Wand2 },
    { title: 'استلم واستمتع', description: 'قصة جاهزة في 7-10 أيام عمل.', icon: Package },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Header */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest border border-blue-100">
          مشروع إنها لك
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
          قصة فريدة... بطلها طفلك
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
          قصص ومنتجات مخصصة تجعل الطفل جزءًا من الحكاية، وتجعل الأسرة شريكةً في اختيار الفكرة أو القيمة التي تُنسج حولها.
        </p>
      </section>

      {/* Path Selection */}
      <section className="w-full max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <Link href="/enha-lak/custom" className="group block bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden text-center md:text-right">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform">
              <PenTool className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">أنت البطل هنا</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              نصنع محتوى مخصصاً لطفلك من الصفر بعد إتمام الطلب، ليكون هو محور القصة بأدق تفاصيلها.
            </p>
          </Link>

          <Link href="/enha-lak/library" className="group block bg-white border border-slate-200 rounded-3xl p-8 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 relative overflow-hidden text-center md:text-right">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">المكتبة العامة</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              اختر قصة جاهزة من المكتبة وخصص غلافها فقط، محتوى القصة الأصلي يبقى كما هو.
            </p>
          </Link>
        </div>
      </section>

      {/* Power of Personalization */}
      <section className="w-full max-w-6xl mx-auto bg-slate-50/50 rounded-3xl p-8 md:p-12 border border-slate-100">
        <h2 className="text-3xl font-black text-center mb-12 text-slate-800">قوة القصة الشخصية</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${benefit.bg} ${benefit.color} mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{benefit.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="w-full max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-16 text-slate-800">كيف تعمل؟</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-12 right-12 h-0.5 bg-slate-100 -z-10"></div>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 mx-auto bg-white border-2 border-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-sm">
                  <Icon className="w-7 h-7" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 font-medium">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12 text-slate-800">ماذا تقول الأسر عنا؟</h2>
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
    </div>
  );
}
