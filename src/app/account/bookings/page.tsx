
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
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
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
