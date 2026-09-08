import { formatDate } from '@/lib/utils';
import { getNotifications } from '@/data/mock';
import { Bell } from 'lucide-react';

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">الإشعارات</h1>
      
      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 flex flex-col items-center justify-center gap-4 text-slate-400">
          <Bell className="h-16 w-16 opacity-50" />
          <p className="text-lg font-bold text-slate-500">لا توجد إشعارات جديدة.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <div key={notif.id} className={`rounded-2xl border p-4 shadow-sm ${notif.isRead ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`font-bold ${notif.isRead ? 'text-slate-800' : 'text-blue-900'}`}>{notif.title}</p>
                  <p className={`mt-1 text-sm ${notif.isRead ? 'text-slate-600' : 'text-blue-700'}`}>{notif.message}</p>
                </div>
                <span className="text-xs text-slate-400">{formatDate(notif.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
