import { getCurrentUser, getWritingPackages, getOrders, getBookings, getInstructors } from '@/data/mock';
import { redirect } from 'next/navigation';
import { Package, ShoppingCart, Calendar, Users, Activity, FileText } from 'lucide-react';

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

  const activePackages = packages.filter(p => p.isActive).length;
  
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sortedBookings = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
        <Activity className="w-8 h-8 text-amber-500" />
        لوحة تحكم الإدارة
      </h1>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <Package className="w-8 h-8 text-amber-500 mb-4" />
          <div className="text-3xl font-black text-slate-800">{activePackages}</div>
          <div className="text-sm font-bold text-slate-500 mt-1">باقات نشطة</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <ShoppingCart className="w-8 h-8 text-blue-500 mb-4" />
          <div className="text-3xl font-black text-slate-800">{orders.length}</div>
          <div className="text-sm font-bold text-slate-500 mt-1">إجمالي الطلبات</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <Calendar className="w-8 h-8 text-indigo-500 mb-4" />
          <div className="text-3xl font-black text-slate-800">{bookings.length}</div>
          <div className="text-sm font-bold text-slate-500 mt-1">إجمالي الحجوزات</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <Users className="w-8 h-8 text-green-500 mb-4" />
          <div className="text-3xl font-black text-slate-800">{instructors.length}</div>
          <div className="text-sm font-bold text-slate-500 mt-1">المدربين</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Latest Orders */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            أحدث الطلبات
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-slate-500 bg-slate-50 border-y border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-bold">رقم الطلب</th>
                  <th className="px-4 py-3 font-bold">الطالب</th>
                  <th className="px-4 py-3 font-bold">المبلغ</th>
                  <th className="px-4 py-3 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-4 font-bold text-slate-700">#{order.id.split('-')[1]}</td>
                    <td className="px-4 py-4 text-slate-600 font-medium">{order.userId.split('-')[1]}</td>
                    <td className="px-4 py-4 text-slate-600 font-bold">{order.totalAmount} ج.م</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
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
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            أحدث الحجوزات
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-slate-500 bg-slate-50 border-y border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-bold">رقم الحجز</th>
                  <th className="px-4 py-3 font-bold">الطالب</th>
                  <th className="px-4 py-3 font-bold">الموعد</th>
                  <th className="px-4 py-3 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedBookings.map(booking => {
                  const date = new Date(booking.scheduledAt);
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-4 font-bold text-slate-700">#{booking.id.split('-')[1]}</td>
                      <td className="px-4 py-4 text-slate-600 font-medium">{booking.studentId.split('-')[1]}</td>
                      <td className="px-4 py-4 text-slate-600 font-medium whitespace-nowrap">
                        {date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          booking.status === 'confirmed' ? 'bg-indigo-100 text-indigo-700' : 
                          booking.status === 'completed' ? 'bg-slate-100 text-slate-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
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
