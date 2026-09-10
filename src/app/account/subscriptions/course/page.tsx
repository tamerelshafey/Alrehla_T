import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';

export default function SubCoursePage() {
  const data = [
    { id: 1, name: 'مسار الإبداع التأسيسي', progress: '3 من 8' }
  ];

  const columns = [
    { header: 'الباقة', accessorKey: 'name' },
    { header: 'الجلسة الحالية', accessorKey: 'progress' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="باقات بداية الرحلة" />
      <SimpleDataTable columns={columns} data={data} />
    </div>
  );
}
