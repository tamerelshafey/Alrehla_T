import { getCurrentUser, getBookings } from '@/data/mock';
import { redirect } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { InstructorSessionClient } from './InstructorSessionClient';

export const dynamic = 'force-dynamic';

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (user.role !== 'instructor') {
    redirect('/dashboard');
  }

  const { id } = await params;
  const bookings = await getBookings();
  const session = bookings[0]; // Just mock first booking for demo

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title={`جلسة مسار شغف الكتابة`} 
        backHref="/dashboard/instructor"
      />
      <InstructorSessionClient session={session} />
    </div>
  );
}
