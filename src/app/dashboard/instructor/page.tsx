import { getCurrentUser, getBookings } from '@/data/mock';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Calendar, Video, Clock, Wallet, User, CalendarDays, Settings } from 'lucide-react';
import { InstructorRatingsWidget } from '@/components/dashboard/InstructorRatingsWidget';

export const dynamic = 'force-dynamic';

export default async function InstructorDashboard() {
  const user = await getCurrentUser();

  if (user.role !== 'instructor') {
    redirect('/dashboard');
  }

  const allBookings = await getBookings();
  const confirmedBookings = allBookings.filter((b) => b.status === 'confirmed');

  // Sort by date closest first
  const upcomingSessions = [...confirmedBookings].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  // Count unique students
  const uniqueStudents = new Set(allBookings.map((b) => b?.independentParticipantId)).size;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-black text-slate-900">
          مرحباً أستاذ(ة)، {user.fullName}
        </h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/instructor/students" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
            <Users className="h-4 w-4" /> المتدربين
          </Link>
          <Link href="/dashboard/instructor/profile" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
            <User className="h-4 w-4" /> الملف الشخصي
          </Link>
          <Link href="/dashboard/instructor/settings" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
            <Settings className="h-4 w-4" /> إعدادات العمل
          </Link>
          <Link href="/dashboard/instructor/payouts" className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800">
            <Wallet className="h-4 w-4" /> المستحقات
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Users className="mb-4 h-8 w-8 text-amber-500" />
          <div className="text-3xl font-black text-slate-800">
            {uniqueStudents}
          </div>
          <div className="mt-1 text-sm font-bold text-slate-500">
            الطلاب الحاليين
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Calendar className="mb-4 h-8 w-8 text-blue-500" />
          <div className="text-3xl font-black text-slate-800">
            {confirmedBookings.length}
          </div>
          <div className="mt-1 text-sm font-bold text-slate-500">
            جلسات قادمة
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Sessions */}
        <section className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
            <Video className="h-5 w-5 text-indigo-500" />
            جلساتي القادمة
          </h2>
          <div className="space-y-4">
            {upcomingSessions.map((session, index) => {
              const date = new Date(session.scheduledAt);
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <div
                  key={session.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 md:flex-row md:items-center ${isToday ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 bg-slate-50'} gap-4`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl font-bold ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'border border-slate-200 bg-white text-slate-700'}`}
                    >
                      <span className="text-xs">
                        {date.toLocaleDateString('ar-EG', { month: 'short' })}
                      </span>
                      <span className="text-lg leading-none">
                        {date.getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">
                        جلسة مع الطالب (رقم {(session?.independentParticipantId || session?.dependentParticipantId || '')?.split('-')[1]})
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Clock className="h-4 w-4" />
                        {date.toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-3 md:w-auto">
                    <Link 
                      href={`/dashboard/instructor/sessions/s-${index}`}
                      className="flex-1 rounded-xl bg-slate-900 px-6 py-2 text-center text-sm font-bold whitespace-nowrap text-white shadow-md transition-colors hover:bg-slate-800 md:flex-none"
                    >
                      دخول الجلسة
                    </Link>
                    <Link 
                      href={`/dashboard/instructor/students/${(session?.independentParticipantId || session?.dependentParticipantId || '')}`}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-bold whitespace-nowrap text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      الملف
                    </Link>
                  </div>
                </div>
              );
            })}
            {upcomingSessions.length === 0 && (
              <div className="py-8 text-center font-medium text-slate-500">
                لا توجد جلسات مجدولة حالياً.
              </div>
            )}
          </div>
        </section>

        {/* Ratings Widget */}
        <div className="lg:col-span-1">
          <InstructorRatingsWidget />
        </div>
      </div>
    </div>
  );
}
