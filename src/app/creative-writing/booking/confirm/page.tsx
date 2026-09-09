
import { PageContainer } from '@/components/PageContainer';
import { BookingConfirmClient } from './BookingConfirmClient';

export default function BookingConfirmPage() {
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-3xl pt-12 pb-24">
        <h1 className="mb-10 text-center text-3xl font-black text-slate-800 md:text-5xl">تأكيد ومراجعة الحجز</h1>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-10">
          <BookingConfirmClient />
        </div>
      </div>
    </PageContainer>
  );
}
