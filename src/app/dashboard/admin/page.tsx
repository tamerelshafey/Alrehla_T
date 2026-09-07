import {
  getCurrentUser,
  getWritingPackages,
  getOrders,
  getBookings,
  getInstructors,
} from '@/data/mock';
import { redirect } from 'next/navigation';
import {
  Package,
  ShoppingCart,
  Calendar,
  Users,
  Activity,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (user.role !== 'super_admin' && user.role !== 'general_supervisor') {
    redirect('/dashboard');
  }

  const packages = await getWritingPackages();
  const orders = await getOrders();
  const bookings = await getBookings();
  const instructors = await getInstructors();

  const activePackages = packages.filter((p) => p.isActive).length;

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
      <h1 className="mb-8 flex items-center gap-3 text-3xl font-black text-slate-900">
        <Activity className="h-8 w-8 text-amber-500" />
        لوحة تحكم الإدارة
      </h1>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Package className="mb-4 h-8 w-8 text-amber-500" />
          <div className="text-3xl font-black text-slate-800">
            {activePackages}
          </div>
          <div className="mt-1 text-sm font-bold text-slate-500">
            باقات نشطة
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <ShoppingCart className="mb-4 h-8 w-8 text-blue-500" />
          <div className="text-3xl font-black text-slate-800">
            {orders.length}
          </div>
          <div className="mt-1 text-sm font-bold text-slate-500">
            إجمالي الطلبات
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Calendar className="mb-4 h-8 w-8 text-indigo-500" />
          <div className="text-3xl font-black text-slate-800">
            {bookings.length}
          </div>
          <div className="mt-1 text-sm font-bold text-slate-500">
            إجمالي الحجوزات
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Users className="mb-4 h-8 w-8 text-green-500" />
          <div className="text-3xl font-black text-slate-800">
            {instructors.length}
          </div>
          <div className="mt-1 text-sm font-bold text-slate-500">المدربين</div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Latest Orders */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            أحدث الطلبات
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-y border-slate-100 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">رقم الطلب</th>
                  <th className="px-4 py-3 font-bold">الطالب</th>
                  <th className="px-4 py-3 font-bold">المبلغ</th>
                  <th className="px-4 py-3 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-4 font-bold text-slate-700">
                      #{order.id.split('-')[1]}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-600">
                      {order.userId.split('-')[1]}
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-600">
                      {order.totalAmount} ج.م
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-bold ${
                          order.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Latest Bookings */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
            <Calendar className="h-5 w-5 text-indigo-500" />
            أحدث الحجوزات
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-y border-slate-100 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">رقم الحجز</th>
                  <th className="px-4 py-3 font-bold">الطالب</th>
                  <th className="px-4 py-3 font-bold">الموعد</th>
                  <th className="px-4 py-3 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedBookings.map((booking) => {
                  const date = new Date(booking.scheduledAt);
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-4 font-bold text-slate-700">
                        #{booking.id.split('-')[1]}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-600">
                        {booking.studentId.split('-')[1]}
                      </td>
                      <td className="px-4 py-4 font-medium whitespace-nowrap text-slate-600">
                        {date.toLocaleDateString('ar-EG', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-bold ${
                            booking.status === 'confirmed'
                              ? 'bg-indigo-100 text-indigo-700'
                              : booking.status === 'completed'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
