
import { getFamilyMembers, getOrders, getBookings, getNotifications } from '@/data/mock';

export default async function AccountOverview() {
  const family = await getFamilyMembers();
  const orders = await getOrders();
  const bookings = await getBookings();
  const notifications = await getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">نظرة عامة</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">أفراد العائلة</p>
          <p className="mt-2 text-3xl font-black text-slate-800">{family.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">الطلبات النشطة</p>
          <p className="mt-2 text-3xl font-black text-slate-800">{orders.filter(o => o.status === 'paid' || o.status === 'pending').length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">الجلسات القادمة</p>
          <p className="mt-2 text-3xl font-black text-slate-800">{bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-amber-700">الإشعارات غير المقروءة</p>
          <p className="mt-2 text-3xl font-black text-amber-900">{unreadCount}</p>
        </div>
      </div>
    </div>
  );
}
