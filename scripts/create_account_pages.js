const fs = require('fs');
const path = require('path');

const layoutContent = `
import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { Users, ShoppingBag, Calendar, Package, HelpCircle, Bell, User } from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer className="flex-row items-start space-y-0 gap-8 py-10">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <nav className="space-y-1">
          <Link href="/account" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <User className="h-4 w-4" /> نظرة عامة
          </Link>
          <Link href="/account/family" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <Users className="h-4 w-4" /> أفراد العائلة
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-bold tracking-wider text-slate-400 uppercase">الطلبات والمواعيد</p>
          </div>
          <Link href="/account/orders/enha-lak" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <ShoppingBag className="h-4 w-4" /> طلبات إنها لك
          </Link>
          <Link href="/account/bookings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <Calendar className="h-4 w-4" /> المواعيد والجلسات
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-bold tracking-wider text-slate-400 uppercase">الاشتراكات</p>
          </div>
          <Link href="/account/subscriptions/box" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <Package className="h-4 w-4" /> صندوق الرحلة
          </Link>
          <Link href="/account/subscriptions/course" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <Package className="h-4 w-4" /> باقات بداية الرحلة
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-bold tracking-wider text-slate-400 uppercase">أخرى</p>
          </div>
          <Link href="/account/support" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <HelpCircle className="h-4 w-4" /> تذاكر الدعم
          </Link>
          <Link href="/account/notifications" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <Bell className="h-4 w-4" /> الإشعارات
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full space-y-6">
        {children}
      </div>
    </PageContainer>
  );
}
`;

const pageOverview = `
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
`;

const pageFamily = `
import { getFamilyMembers } from '@/data/mock';

export default async function FamilyPage() {
  const family = await getFamilyMembers();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">أفراد العائلة</h1>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
          إضافة مشارك
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {family.map(member => (
          <div key={member.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
              {member.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-800">{member.name}</p>
              <p className="text-sm text-slate-500">{member.age} سنوات</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

const pageOrdersEnhaLak = `
import { getOrders } from '@/data/mock';

export default async function EnhaLakOrdersPage() {
  const orders = await getOrders();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">طلبات إنها لك</h1>
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4 font-medium">رقم الطلب</th>
              <th className="p-4 font-medium">التاريخ</th>
              <th className="p-4 font-medium">الإجمالي</th>
              <th className="p-4 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map(order => (
              <tr key={order.id}>
                <td className="p-4 font-bold text-slate-700">{order.id}</td>
                <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                <td className="p-4 font-medium text-slate-700">{order.totalAmount} ج.م</td>
                <td className="p-4">
                  <span className={\`inline-flex rounded-full px-2 py-1 text-xs font-bold \${order.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}\`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;

const pageBookings = `
import { getBookings } from '@/data/mock';

export default async function BookingsPage() {
  const bookings = await getBookings();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">المواعيد والجلسات</h1>
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4 font-medium">رقم الحجز</th>
              <th className="p-4 font-medium">تاريخ الجلسة</th>
              <th className="p-4 font-medium">الباقة</th>
              <th className="p-4 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td className="p-4 font-bold text-slate-700">{booking.id}</td>
                <td className="p-4 text-slate-500" dir="ltr">{new Date(booking.scheduledAt).toLocaleString('ar-EG')}</td>
                <td className="p-4 font-medium text-slate-700">{booking.packageId}</td>
                <td className="p-4">
                  <span className={\`inline-flex rounded-full px-2 py-1 text-xs font-bold \${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}\`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;

const pageSubBox = `
export default function SubBoxPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">اشتراك صندوق الرحلة</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">اشتراك 6 أشهر (فعال)</h2>
        <p className="mt-2 text-slate-500">تاريخ التسليم القادم: 15 نوفمبر 2023</p>
        <div className="mt-6 flex items-center gap-4">
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600">إدارة الاشتراك</button>
        </div>
      </div>
    </div>
  );
}
`;

const pageSubCourse = `
export default function SubCoursePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">باقات بداية الرحلة</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">مسار الإبداع التأسيسي</h2>
        <p className="mt-2 text-slate-500">الجلسة الحالية: 3 من 8</p>
        <div className="mt-6 w-full rounded-full bg-slate-100 h-2">
          <div className="bg-amber-500 h-2 rounded-full" style={{ width: '37.5%' }}></div>
        </div>
      </div>
    </div>
  );
}
`;

const pageSupport = `
import { getMyTickets } from '@/data/mock';

export default async function SupportPage() {
  const tickets = await getMyTickets();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">تذاكر الدعم</h1>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
          تذكرة جديدة
        </button>
      </div>
      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="font-bold text-slate-800">{ticket.subject}</p>
              <p className="text-xs text-slate-500">{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}</p>
            </div>
            <span className={\`inline-flex rounded-full px-2 py-1 text-xs font-bold \${
              ticket.status === 'open' ? 'bg-amber-50 text-amber-700' :
              ticket.status === 'answered' ? 'bg-emerald-50 text-emerald-700' :
              'bg-slate-100 text-slate-700'
            }\`}>
              {ticket.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

const pageNotifications = `
import { getNotifications } from '@/data/mock';

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">الإشعارات</h1>
      <div className="space-y-4">
        {notifications.map(notif => (
          <div key={notif.id} className={\`rounded-2xl border p-4 shadow-sm \${notif.isRead ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-100'}\`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={\`font-bold \${notif.isRead ? 'text-slate-800' : 'text-blue-900'}\`}>{notif.title}</p>
                <p className={\`mt-1 text-sm \${notif.isRead ? 'text-slate-600' : 'text-blue-700'}\`}>{notif.message}</p>
              </div>
              <span className="text-xs text-slate-400">{new Date(notif.createdAt).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/app/account/layout.tsx', layoutContent);
fs.writeFileSync('src/app/account/page.tsx', pageOverview);
fs.writeFileSync('src/app/account/family/page.tsx', pageFamily);
fs.writeFileSync('src/app/account/orders/enha-lak/page.tsx', pageOrdersEnhaLak);
// We redirect creative-writing orders to bookings logically or just reuse the bookings page there
fs.writeFileSync('src/app/account/orders/creative-writing/page.tsx', `import BookingsPage from '../../bookings/page'; export default BookingsPage;`);
fs.writeFileSync('src/app/account/bookings/page.tsx', pageBookings);
fs.writeFileSync('src/app/account/subscriptions/box/page.tsx', pageSubBox);
fs.writeFileSync('src/app/account/subscriptions/course/page.tsx', pageSubCourse);
fs.writeFileSync('src/app/account/support/page.tsx', pageSupport);
fs.writeFileSync('src/app/account/notifications/page.tsx', pageNotifications);

console.log("Account pages created.");
