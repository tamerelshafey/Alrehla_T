import { Sparkles, PenTool, Heart } from 'lucide-react';
import { SectionSubNav } from '@/components/SectionSubNav';
import { PageContainer } from '@/components/PageContainer';
import { SectionHeader } from '@/components/SectionHeader';

const creativeWritingTabs = [
  { name: 'نظرة عامة', href: '/creative-writing' },
  { name: 'عن البرنامج', href: '/creative-writing/about' },
  { name: 'الباقات', href: '/creative-writing/packages' },
  { name: 'المدربون', href: '/creative-writing/instructors' },
  { name: 'الخدمات الإبداعية', href: '/creative-writing/services' },
];

export default function AboutProgramPage() {
  const features = [
    {
      title: 'الإلهام أولاً',
      description:
        'نبدأ بإشعال شرارة الفضول والخيال قبل الخوض في تقنيات الكتابة المعقدة.',
      icon: Sparkles,
      color: 'text-emerald-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'الممارسة تصنع المبدع',
      description:
        'نؤمن أن الكتابة مهارة تنمو بالتجربة والمحاولة المستمرة أكثر من التنظير.',
      icon: PenTool,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      title: 'الثقة هي المفتاح',
      description:
        'نبني مساحة آمنة تمنح المشارك الثقة بصوته وقدراته دون خوف من الخطأ.',
      icon: Heart,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <PageContainer>
      {/* Hero Section */}
      <SectionHeader
        title="عن «بداية الرحلة»"
        titleClassName="md:text-6xl"
        subNav={
          <SectionSubNav
            tabs={creativeWritingTabs}
            activeColorClass="bg-emerald-600 text-white"
          />
        }
        description="الكتابة مساحة للتعبير والنمو"
      />

      {/* Why Us Section */}
      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-100 bg-slate-50 p-8 md:p-16">
        <h2 className="mb-8 text-center text-3xl font-black text-slate-800">
          لماذا «بداية الرحلة»؟
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg font-medium text-slate-600">
          لأن الكتابة أكثر من مهمة مدرسية: يمكن أن تكون مساحة للتفكير والتجريب
          وصناعة المعنى.
        </p>
        <div className="space-y-6">
          {[
            'مساحة تحتفي بالمحاولة، وتتعامل مع الخطأ باعتباره جزءًا طبيعيًا من التعلم.',
            'جلسات فردية تتيح اهتمامًا مركزًا بالمشارك واحتياجاته.',
            'تجربة تتكيف مع العمر والعلاقة الحالية بالكتابة والاهتمامات.',
          ].map((point, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="h-3 w-3 shrink-0 rounded-full bg-emerald-500"></div>
              <p className="text-lg leading-relaxed font-medium text-slate-700">
                {point}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Distinctive Features */}
      <section className="mx-auto w-full max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          ما الذي يميزنا؟
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm"
              >
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${feature.bg} ${feature.color} mb-6`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-slate-800">
                  {feature.title}
                </h3>
                <p className="leading-relaxed font-medium text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </PageContainer>
  );
}
