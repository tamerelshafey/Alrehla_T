const fs = require('fs');
const content = `import { formatDate } from '@/lib/utils';
import { getBookings } from '@/data/mock';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';

export default async function BookingsPage() {
  const bookings = await getBookings();
  
  const formattedBookings = bookings.map(booking => ({
    ...booking,
    idDisplay: booking.id,
    dateDisplay: formatDate(booking.scheduledAt),
    packageDisplay: booking.packageId,
    statusDisplay: (
      <span className={\`inline-flex rounded-full px-2 py-1 text-xs font-bold \${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}\`}>
        {booking.status}
      </span>
    )
  }));

  const columns = [
    { header: 'رقم الحجز', accessorKey: 'idDisplay' },
    { header: 'تاريخ الجلسة', accessorKey: 'dateDisplay' },
    { header: 'الباقة', accessorKey: 'packageDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="المواعيد والجلسات" />
      <SimpleDataTable columns={columns} data={formattedBookings} />
    </div>
  );
}
`;
fs.writeFileSync('src/app/account/bookings/page.tsx', content);
