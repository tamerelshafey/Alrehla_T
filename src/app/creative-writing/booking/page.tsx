import { PageContainer } from '@/components/PageContainer';
import { BookingWizardClient } from '@/components/creative-writing/BookingWizardClient';
import { mockInstructors } from '@/data/mock';
import { Section } from '@/components/ui/Section';

export default async function BookingPage() {
  const instructors = mockInstructors;
  return (
    <PageContainer className="!py-0 !space-y-0">
      <Section containerClassName="mx-auto w-full max-w-4xl pt-12 pb-24">
        <h1 className="mb-10 text-center text-3xl font-black text-slate-800 md:text-5xl">حجز مسار تدريبي</h1>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg font-medium text-slate-500">
          اختر الباقة المناسبة والمدرب، ثم حدد موعدك الأسبوعي الثابت طوال فترة التدريب.
        </p>
        <BookingWizardClient instructors={instructors} />
      </Section>
    </PageContainer>
  );
}
