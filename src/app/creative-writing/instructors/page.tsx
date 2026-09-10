import { getInstructors } from '@/data/mock';
import { User, Award, CheckCircle } from 'lucide-react';

import { PageContainer } from '@/components/PageContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';


export default async function InstructorsPage() {
  const instructors = await getInstructors();

  return (
    <PageContainer className="!py-0 !space-y-0">
      {/* Header */}
      <Section containerClassName="pt-8 pb-12">
        <SectionHeader
          title="مدربو «بداية الرحلة»"
          
          description="فريق من الكُتّاب والتربويين المتخصصين في أدب الطفل واليافعين، يجمعون بين الشغف الإبداعي والقدرة على التوجيه بأسلوب داعم ومحفز."
        />
      </Section>

      {/* Instructors Grid */}
      <Section containerClassName="mx-auto w-full max-w-6xl pb-20">
        <div className="grid gap-8 md:grid-cols-2">
          {instructors.map((instructor) => (
            <Card
              key={instructor.id}
              accentColor="emerald"
              className="relative flex flex-col overflow-hidden p-8"
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
                  <h2 className="mb-2 text-2xl font-black text-slate-800">
                    {instructor.displayName}
                  </h2>
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                    <Award className="h-4 w-4" />
                    خبرة {instructor.yearsExperience} سنوات
                  </div>
                </div>
              </div>

              <p className="mb-8 flex-1 text-base leading-relaxed font-medium text-slate-600">
                {instructor.bio}
              </p>

              <div>
                <h3 className="mb-3 text-sm font-bold tracking-wider text-slate-800 uppercase">
                  التخصصات:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {instructor.specialties.map((specialty: string, idx: number) => (
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
            </Card>
          ))}
        </div>
      </Section>
    </PageContainer>
  );
}
