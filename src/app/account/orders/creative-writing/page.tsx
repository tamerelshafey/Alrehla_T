import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { PenTool, User, Shield, BookOpen, ChevronLeft, Calendar, Clock, Video } from 'lucide-react';
import { getBookings, getServiceOrders } from '@/data/mock';
import { StatusBadge } from '@/components/StatusBadge';

export default async function CreativeWritingOrdersPage() {
  const allBookings = await getBookings();
  const allServiceOrders = await getServiceOrders();
  
  const bookings = allBookings.map(b => {
    const so = allServiceOrders.find(o => o.id === b.id);
    const displayStatus = so?.status === 'awaiting_verification' ? 'awaiting_verification' : b.status;
    return {
      id: b.id,
      date: new Date(b.scheduledAt).toLocaleDateString('ar-EG'),
      time: new Date(b.scheduledAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}),
      status: displayStatus,
      instructor: 'سارة أحمد', // Placeholder for mock
      studentName: 'الطالب',
      packageName: 'باقة تدريبية'
    };
  });
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-7xl pt-12 pb-24">
        <div className="flex flex-col gap-8 md:flex-row">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
             <nav className="flex flex-col gap-2 sticky top-24">
              <Link href="/account" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <User className="h-5 w-5" />
                <span>نظرة عامة</span>
              </Link>
              <Link href="/account/family" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <Shield className="h-5 w-5" />
                <span>عائلتي</span>
              </Link>
              <Link href="/account/orders/enha-lak" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <BookOpen className="h-5 w-5" />
                <span>طلبات "إنها لك"</span>
              </Link>
              <Link href="/account/orders/creative-writing" className="flex items-center gap-3 rounded-xl bg-emerald-50 text-emerald-700 px-4 py-3 font-bold">
                <PenTool className="h-5 w-5" />
                <span>حجوزات بداية الرحلة</span>
              </Link>
            </nav>
          </aside>

          {/* Main Area */}
          <main className="flex-1 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-800">الجلسات والباقات</h1>
                <p className="mt-2 text-slate-500 font-medium">إدارة ومتابعة حجوزات برامج الكتابة الإبداعية.</p>
              </div>
            </div>

            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-800">{booking.packageName}</h3>
                        <StatusBadge type={booking.status === 'confirmed' ? 'success' : booking.status === 'awaiting_verification' ? 'warning' : booking.status === 'completed' ? 'neutral' : 'warning'} label={booking.status === 'confirmed' ? 'مؤكد' : booking.status === 'awaiting_verification' ? 'بانتظار تأكيد الدفع' : booking.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span>المدرب: <strong className="text-slate-800">{booking.instructor}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-slate-400" />
                          <span>للمتدرب(ة): <strong className="text-slate-800">{booking.studentName}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex shrink-0 flex-col gap-3">
                      {booking.status === 'confirmed' && (
                        <button className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-700">
                          <Video className="h-5 w-5" />
                          رابط الجلسة
                        </button>
                      )}
                      <button className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-slate-50 px-6 py-3 font-bold text-slate-700 hover:bg-slate-100">
                        تفاصيل الحجز
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </main>
        </div>
      </div>
    </PageContainer>
  );
}
