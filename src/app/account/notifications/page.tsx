import { getNotifications, getCurrentUser } from '@/data/mock';
import { redirect } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }
  const notifications = await getNotifications();
  
  const formatted = notifications.map(notif => ({
    id: notif.id,
    title: notif.title,
    message: notif.message,
    date: formatDate(notif.createdAt),
    statusDisplay: notif.isRead ? <CheckCircle2 className="h-5 w-5 text-slate-400" /> : <Circle className="h-5 w-5 text-blue-600 fill-blue-50" />
  }));

  const columns = [
    { header: '', accessorKey: 'statusDisplay' },
    { header: 'العنوان', accessorKey: 'title' },
    { header: 'التفاصيل', accessorKey: 'message' },
    { header: 'التاريخ', accessorKey: 'date' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="الإشعارات" />
      <p className="mt-2 text-slate-500 font-medium">تابع آخر التحديثات، التقييمات، وحالة طلباتك.</p>
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
