import Link from 'next/link';
import { getTestimonials } from '@/data/mock';
import {
  Fingerprint,
  BookOpen,
  PenTool,
  Sparkles,
  User,
  FileEdit,
  Wand2,
  Package,
  Quote,
} from 'lucide-react';

export default async function EnhaLakPage() {
  const testimonials = await getTestimonials();

  const benefits = [
    {
      title: 'تعزيز الهوية',
      description:
        'عندما يرى الطفل نفسه بطلاً، يزداد تقديره لذاته وثقته بنفسه.',
      icon: Fingerprint,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'شغف القراءة',
      description: 'الارتباط الشخصي بالقصة يحول القراءة من واجب إلى متعة.',
      icon: BookOpen,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: 'غرس القيم',
      description: 'الرسائل التربوية أكثر تأثيراً عندما يعيشها الطفل بنفسه.',
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const steps = [
    {
      title: 'املأ البيانات',
      description: 'اسم الطفل، عمره، صورته، هواياته.',
      icon: User,
    },
    { title: 'اختر القيمة', description: 'حدد الهدف التربوي.', icon: FileEdit },
    {
      title: 'انتظر السحر',
      description: 'فريقنا ينسج قصة مخصصة.',
      icon: Wand2,
    },
    {
      title: 'استلم واستمتع',
      description: 'قصة جاهزة في 7-10 أيام عمل.',
      icon: Package,
    },
  ];

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-start space-y-24 px-6 py-20 font-sans text-slate-800 md:px-12">
      {/* Header */}
      <section className="mx-auto max-w-4xl space-y-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-bold tracking-widest text-blue-700 uppercase">
          مشروع إنها لك
        </div>
        <h1 className="text-4xl leading-tight font-black text-slate-900 md:text-6xl">
          قصة فريدة... بطلها طفلك
        </h1>
        <p className="text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
          قصص ومنتجات مخصصة تجعل الطفل جزءًا من الحكاية، وتجعل الأسرة شريكةً في
          اختيار الفكرة أو القيمة التي تُنسج حولها.
        </p>
      </section>

      {/* Path Selection */}
      <section className="mx-auto w-full max-w-5xl">
        <div className="grid gap-8 md:grid-cols-2">
          <Link
            href="/enha-lak/custom"
            className="group relative block overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 md:text-right"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110 md:mx-0">
              <PenTool className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-800">
              أنت البطل هنا
            </h3>
            <p className="leading-relaxed font-medium text-slate-600">
              نصنع محتوى مخصصاً لطفلك من الصفر بعد إتمام الطلب، ليكون هو محور
              القصة بأدق تفاصيلها.
            </p>
          </Link>

          <Link
            href="/enha-lak/library"
            className="group relative block overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center transition-all duration-300 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 md:text-right"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110 md:mx-0">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-800">
              المكتبة العامة
            </h3>
            <p className="leading-relaxed font-medium text-slate-600">
              اختر قصة جاهزة من المكتبة وخصص غلافها فقط، محتوى القصة الأصلي يبقى
              كما هو.
            </p>
          </Link>
        </div>
      </section>

      {/* Power of Personalization */}
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-100 bg-slate-50/50 p-8 md:p-12">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          قوة القصة الشخصية
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${benefit.bg} ${benefit.color} mb-6`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-800">
                  {benefit.title}
                </h3>
                <p className="leading-relaxed font-medium text-slate-500">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl">
        <h2 className="mb-16 text-center text-3xl font-black text-slate-800">
          كيف تعمل؟
        </h2>
        <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="absolute top-8 right-12 left-12 -z-10 hidden h-0.5 bg-slate-100 md:block"></div>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-blue-100 bg-white text-blue-600 shadow-sm">
                  <Icon className="h-7 w-7" />
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {index + 1}
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-800">
                  {step.title}
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          ماذا تقول الأسر عنا؟
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
    </div>
  );
}
