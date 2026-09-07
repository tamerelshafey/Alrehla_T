import { getInstructors } from '@/data/mock';
import { User, Award, CheckCircle } from 'lucide-react';
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

export default async function InstructorsPage() {
  const instructors = await getInstructors();

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="مدربو «بداية الرحلة»"
        subNav={
          <SectionSubNav
            tabs={creativeWritingTabs}
            activeColorClass="bg-sky-600 text-white"
          />
        }
        description="فريق من الكُتّاب والتربويين المتخصصين في أدب الطفل واليافعين، يجمعون بين الشغف الإبداعي والقدرة على التوجيه بأسلوب داعم ومحفز."
      />

      {/* Instructors Grid */}
      <section className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 md:grid-cols-2">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-xl"
            >
              {instructor.isSample && (
                <div className="absolute top-4 right-4 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  بيانات تجريبية
                </div>
              )}

              <div className="mt-4 mb-6 flex items-center gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
                  <User className="h-10 w-10 text-slate-400" />
                </div>
                <div>
                  <h3 className="mb-2 text-2xl font-black text-slate-800">
                    {instructor.displayName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-600">
                    <Award className="h-4 w-4" />
                    خبرة {instructor.yearsExperience} سنوات
                  </div>
                </div>
              </div>

              <p className="mb-8 flex-1 text-base leading-relaxed font-medium text-slate-600">
                {instructor.bio}
              </p>

              <div>
                <h4 className="mb-3 text-sm font-bold tracking-wider text-slate-800 uppercase">
                  التخصصات:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {instructor.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600"
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-slate-400" />
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
