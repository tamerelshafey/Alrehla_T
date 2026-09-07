import Link from 'next/link';
import { getTestimonials } from '@/data/mock';
import { SectionSubNav } from '@/components/SectionSubNav';

const creativeWritingTabs = [
  { name: 'نظرة عامة', href: '/creative-writing' },
  { name: 'عن البرنامج', href: '/creative-writing/about' },
  { name: 'الباقات', href: '/creative-writing/packages' },
  { name: 'المدربون', href: '/creative-writing/instructors' },
  { name: 'الخدمات الإبداعية', href: '/creative-writing/services' },
];

import {
  PenTool,
  Target,
  Map,
  ShieldCheck,
  Heart,
  Sparkles,
  User,
  ArrowLeft,
  Quote,
} from 'lucide-react';

export default async function CreativeWritingPage() {
  const allTestimonials = await getTestimonials();
  // Filter for specific testimonials if possible, or just use them
  const testimonials = allTestimonials.filter((t) =>
    t.authorRole.includes('ولي')
  );

  const suitableFor = [
    {
      text: 'لديه أفكار أو صور أو قصص، ويريد أدوات تساعده على تحويلها إلى كتابة أوضح.',
      icon: Sparkles,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      text: 'قد لا يعرف من أين يبدأ، أو يتوقف طويلاً أمام الصفحة البيضاء، ويحتاج إلى مساحة تساعده على المحاولة.',
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      text: 'لديه نصوص أو محاولات ويريد تطوير الفكرة والصياغة والمراجعة مع الحفاظ على صوته.',
      icon: PenTool,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  const features = [
    {
      title: 'مساحة للمحاولة',
      description: 'يبدأ من نقطة تناسبه، من غير مقارنة أو قالب واحد للجميع.',
      icon: ShieldCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'أدوات للكتابة',
      description:
        'يتعرف إلى أدوات تساعده على تنمية الفكرة والوصف والتنظيم والمراجعة.',
      icon: PenTool,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'صوت واختيار',
      description: 'الفكرة والقرارات الأساسية والنص لصاحبها.',
      icon: Heart,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: 'تقدم بلا مقارنة',
      description:
        'ينمو من خلال المحاولة والتغذية الراجعة والمراجعة، لا الدرجات.',
      icon: Target,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-start space-y-32 px-6 py-20 font-sans text-slate-800 md:px-12">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl space-y-6 pt-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-4 py-1.5 text-xs font-bold tracking-widest text-amber-700 uppercase">
          مشروع بداية الرحلة
        </div>
        <h1 className="text-4xl leading-tight font-black text-slate-900 md:text-6xl">
          رحلة كتابة، لا درس كتابة
        </h1>
        <SectionSubNav tabs={creativeWritingTabs} activeColorClass="bg-sky-600 text-white" />
        <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
          برنامج كتابة فردي عبر الإنترنت لأعمار 6–20، يساعد المشارك على تنمية
          أدواته وصوته في الكتابة.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/creative-writing/packages"
            className="rounded-2xl bg-amber-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-amber-200 transition-colors hover:bg-amber-600"
          >
            استعرض الباقات
          </Link>
          <Link
            href="/creative-writing/services"
            className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            الخدمات الإبداعية المستقلة
          </Link>
        </div>
      </section>

      {/* Suitable For */}
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-100 bg-slate-50/50 p-8 md:p-16">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          قد تكون مناسبة إذا كان المشارك...
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {suitableFor.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm"
              >
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${item.bg} ${item.color} mb-6`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <p className="text-lg leading-relaxed font-medium text-slate-600">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl">
        <h2 className="mb-16 text-center text-3xl font-black text-slate-800">
          ماذا يجد المشارك في «بداية الرحلة»؟
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex items-start gap-6">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${feature.bg} ${feature.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-slate-800">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed font-medium text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pathways */}
      <section className="mx-auto w-full max-w-4xl">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          ما يناسبك؟
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/creative-writing/packages"
            className="group block rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Map className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-800">
              باقات «بداية الرحلة»
            </h3>
            <p className="mb-6 font-medium text-slate-600">
              لمن يريد مسارًا متتابعًا
            </p>
            <span className="flex items-center gap-2 font-bold text-amber-600 transition-all group-hover:gap-3">
              اكتشف الباقات <ArrowLeft className="h-4 w-4" />
            </span>
          </Link>
          <Link
            href="/creative-writing/services"
            className="group block rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <PenTool className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-800">
              خدمات إبداعية مستقلة
            </h3>
            <p className="mb-6 font-medium text-slate-600">
              مراجعات واستشارات سريعة
            </p>
            <span className="flex items-center gap-2 font-bold text-blue-600 transition-all group-hover:gap-3">
              اكتشف الخدمات <ArrowLeft className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* Instructors Teaser */}
      <section className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-slate-900 p-8 text-center text-white md:p-12">
        <div className="absolute top-0 right-0 -z-0 h-64 w-64 rounded-full bg-slate-800 blur-3xl"></div>
        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">
            <User className="h-8 w-8" />
          </div>
          <h2 className="mb-6 text-3xl font-black">مدربو «بداية الرحلة»</h2>
          <p className="mx-auto mb-8 max-w-2xl leading-relaxed font-medium text-slate-400">
            فريق من الكُتّاب والتربويين المتخصصين في أدب الطفل واليافعين، يجمعون
            بين الشغف الإبداعي والقدرة على التوجيه بأسلوب داعم ومحفز.
          </p>
          <Link
            href="/creative-writing/instructors"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100"
          >
            تعرّف إلى المدربين
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-5xl">
        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.slice(0, 2).map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"
            >
              <div>
                <Quote className="mb-6 h-10 w-10 text-amber-200" />
                <p className="mb-8 text-lg leading-relaxed font-medium text-slate-700 italic">
                  "{testimonial.content}"
                </p>
              </div>
              <div>
                <div className="font-bold text-slate-900">
                  {testimonial.authorName}
                </div>
                <div className="mt-1 text-sm font-medium text-slate-500">
                  {testimonial.authorRole}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-4xl pb-20 text-center">
        <h2 className="mb-10 text-4xl font-black text-slate-900">
          جاهز للبدء؟
        </h2>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/creative-writing/packages"
            className="rounded-2xl bg-amber-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-amber-200 transition-colors hover:bg-amber-600"
          >
            استعرض الباقات
          </Link>
          <Link
            href="/creative-writing/services"
            className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            اختر خدمة مستقلة
          </Link>
        </div>
      </section>
    </div>
  );
}
