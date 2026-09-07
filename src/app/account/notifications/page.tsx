
import { getNotifications } from '@/data/mock';

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">الإشعارات</h1>
      <div className="space-y-4">
        {notifications.map(notif => (
          <div key={notif.id} className={`rounded-2xl border p-4 shadow-sm ${notif.isRead ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-100'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`font-bold ${notif.isRead ? 'text-slate-800' : 'text-blue-900'}`}>{notif.title}</p>
                <p className={`mt-1 text-sm ${notif.isRead ? 'text-slate-600' : 'text-blue-700'}`}>{notif.message}</p>
              </div>
              <span className="text-xs text-slate-400">{new Date(notif.createdAt).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
