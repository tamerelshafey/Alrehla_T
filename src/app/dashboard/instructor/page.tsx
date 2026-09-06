import { getCurrentUser, getBookings } from '@/data/mock';
import { redirect } from 'next/navigation';
import { Users, Calendar, Video, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InstructorDashboard() {
  const user = await getCurrentUser();
  if (user.role !== 'instructor') {
    redirect('/dashboard');
  }

  const allBookings = await getBookings();
  const confirmedBookings = allBookings.filter(b => b.status === 'confirmed');
  
  // Sort by date closest first
  const upcomingSessions = [...confirmedBookings].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  // Count unique students
  const uniqueStudents = new Set(allBookings.map(b => b.studentId)).size;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-slate-900 mb-8">مرحباً أستاذ(ة)، {user.fullName}</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <Users className="w-8 h-8 text-amber-500 mb-4" />
          <div className="text-3xl font-black text-slate-800">{uniqueStudents}</div>
          <div className="text-sm font-bold text-slate-500 mt-1">الطلاب الحاليين</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <Calendar className="w-8 h-8 text-blue-500 mb-4" />
          <div className="text-3xl font-black text-slate-800">{confirmedBookings.length}</div>
          <div className="text-sm font-bold text-slate-500 mt-1">جلسات قادمة</div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Video className="w-5 h-5 text-indigo-500" />
          جلساتي القادمة
        </h2>

        <div className="space-y-4">
          {upcomingSessions.map((session) => {
            const date = new Date(session.scheduledAt);
            const isToday = new Date().toDateString() === date.toDateString();
            
            return (
              <div key={session.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border ${isToday ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-100'} gap-4`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700'}`}>
                    <span className="text-xs">{date.toLocaleDateString('ar-EG', { month: 'short' })}</span>
                    <span className="text-lg leading-none">{date.getDate()}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">جلسة مع الطالب (رقم {session.studentId.split('-')[1]})</h3>
                    <div className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-colors whitespace-nowrap">
                    دخول الجلسة
                  </button>
                  <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors whitespace-nowrap">
                    الملف
                  </button>
                </div>
              </div>
            );
          })}

          {upcomingSessions.length === 0 && (
            <div className="text-center py-8 text-slate-500 font-medium">
              لا توجد جلسات مجدولة حالياً.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
