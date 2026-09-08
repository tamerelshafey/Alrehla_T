import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'عن منصة الرحلة',
  description: 'تعرف على رؤيتنا ومهمتنا في منصة الرحلة لتطوير قدرات الأطفال والشباب.',
};

import { PageContainer } from '@/components/PageContainer';
import {



  Sparkles,
  Target,
  Compass,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      title: 'الأصالة',
      description: 'محتوى عربي أصيل يحافظ على الهوية',
      icon: Compass,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'الإبداع',
      description: 'حلول مبتكرة تواكب العصر',
      icon: Lightbulb,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'الجودة',
      description: 'معايير عالية في كل ما نقدم',
      icon: ShieldCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'التخصيص',
      description: 'كل طفل فريد ويستحق محتوى خاص',
      icon: UserCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'الشمولية',
      description: 'خدماتنا للجميع بغض النظر عن الخلفية',
      icon: Users,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <section className="mx-auto max-w-4xl space-y-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold tracking-widest text-slate-600 uppercase">
          عن المنصة
        </div>
        <h1 className="text-4xl leading-tight font-black text-slate-900 md:text-6xl">
          رحلتنا: تبدأ بالأمان وتقودها القيم
        </h1>
        <div className="relative mt-12 h-64 w-full overflow-hidden rounded-[2.5rem] md:h-96">
          <img 
            src="https://picsum.photos/seed/aboutplatform/1200/600" 
            alt="فريق الرحلة" 
            className="h-full w-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
        </div>
      </section>

      {/* The Spark */}
      <section className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
        <div className="absolute top-0 right-0 -z-0 h-32 w-32 rounded-bl-full bg-amber-50"></div>
        <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row">
          <div className="shrink-0 rounded-2xl bg-amber-100 p-4 text-amber-600">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-800">الشرارة</h2>
            <p className="text-lg leading-relaxed font-medium text-slate-600">
              في ظل تسارع الرقمنة وتدفّق المحتوى من حولنا، ازدادت حاجتنا إلى
              تجارب لا يضيع فيها الإنسان وسط ما يقرأ ويشاهد. ومن هنا انطلقت
              الشرارة: أن نوظّف الرقمنة لتقريب الحكاية من صاحبها، لا لإبعاده
              عنها؛ فيكون حاضرًا فيها باسمه وصوته واختياراته، مرةً حين تصل إليه
              حكاية تحمل شيئًا منه، ومرةً حين تنطلق الحكاية من داخله.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-8 md:p-12">
          <div className="mb-6 flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">الرسالة</h2>
          </div>
          <p className="text-lg leading-relaxed font-medium text-slate-600">
            نصمّم ونقدّم بالعربية قصصًا ومنتجات مخصّصة وتجارب كتابة فردية آمنة
            لمختلف الأعمار؛ ليكون كل فرد جزءًا من الحكاية، أو تنطلق الحكاية من
            صوته وأفكاره، ضمن تجربة تحترم اختياراته وتدعم تعبيره ونموه.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-8 md:p-12">
          <div className="mb-6 flex items-center gap-4">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">الرؤية</h2>
          </div>
          <p className="text-lg leading-relaxed font-medium text-slate-600">
            أن تكون منصة «الرحلة» وجهة عربية رائدة لتجارب الحكاية والكتابة
            الآمنة والشخصية، يجد فيها كل فرد مساحةً يرى فيها نفسه، ويعبّر عن
            صوته، ويواصل نموه.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="mx-auto w-full max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          قيمنا الأساسية
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md ${index > 2 ? 'md:col-span-1.5' : ''}`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${value.bg} ${value.color} mb-4`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-800">
                  {value.title}
                </h3>
                <p className="font-medium text-slate-500">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </PageContainer>
  );
}
