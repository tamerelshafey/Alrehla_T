import { getCurrentUser, getNotifications } from '@/data/mock';
import { redirect } from 'next/navigation';
import { Bell, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const notifications = await getNotifications();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600" />
            الإشعارات
          </h1>
          <p className="mt-2 text-slate-600">تابع آخر التحديثات، التقييمات، وحالة طلباتك.</p>
        </div>
        <button className="text-sm font-bold text-blue-600 hover:underline">
          تحديد الكل كمقروء
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Bell className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="font-bold text-lg">لا توجد إشعارات جديدة</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`flex items-start gap-4 p-6 transition-colors hover:bg-slate-50 rounded-2xl ${notif.isRead ? 'opacity-70' : 'bg-blue-50/30'}`}
              >
                <div className="mt-1 shrink-0">
                  {notif.isRead ? (
                    <CheckCircle2 className="h-6 w-6 text-slate-400" />
                  ) : (
                    <div className="relative">
                      <Circle className="h-6 w-6 text-blue-600 fill-blue-50" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`font-bold ${notif.isRead ? 'text-slate-700' : 'text-slate-900 text-lg'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm ${notif.isRead ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-center">
        <Link href="/dashboard" className="rounded-xl bg-slate-100 px-6 py-3 font-bold text-slate-700 hover:bg-slate-200 transition-colors">
          العودة للوحة التحكم
        </Link>
      </div>
    </div>
  );
}
