import { getSessions, getServiceOrders } from '@/data/mock';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';

export default async function CreativeWritingOrdersPage() {
  const allBookings = await getSessions();
  const allServiceOrders = await getServiceOrders();
    
  const bookings = allBookings.map(b => {
    const so = allServiceOrders.find(o => o.id === b.id);
    const displayStatus = so?.status === 'awaiting_verification' ? 'awaiting_verification' : b.status;
    return {
      id: b.id,
      date: new Date(b.scheduledAt).toLocaleDateString('ar-EG'),
      time: new Date(b.scheduledAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}),
      statusDisplay: <StatusBadge type={displayStatus === 'confirmed' ? 'success' : displayStatus === 'awaiting_verification' ? 'warning' : displayStatus === 'completed' ? 'neutral' : 'warning'} label={displayStatus === 'confirmed' ? 'مؤكد' : displayStatus === 'awaiting_verification' ? 'بانتظار تأكيد الدفع' : displayStatus === 'completed' ? 'مكتمل' : 'قيد الانتظار'} />,
      instructor: 'سارة أحمد',
      studentName: 'الطالب',
      packageName: 'باقة تدريبية'
    };
  });

  const columns = [
    { header: 'الباقة', accessorKey: 'packageName' },
    { header: 'المدرب', accessorKey: 'instructor' },
    { header: 'المتدرب', accessorKey: 'studentName' },
    { header: 'التاريخ', accessorKey: 'date' },
    { header: 'الوقت', accessorKey: 'time' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="الجلسات والباقات" />
      <p className="mt-2 text-slate-500 font-medium">إدارة ومتابعة حجوزات برامج الكتابة الإبداعية.</p>
      <SimpleDataTable columns={columns} data={bookings} />
    </div>
  );
}
