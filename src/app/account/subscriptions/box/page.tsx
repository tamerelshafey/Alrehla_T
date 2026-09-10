import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';

export default function SubBoxPage() {
  const data = [
    { id: 1, name: 'اشتراك 6 أشهر', date: '15 نوفمبر 2023', statusDisplay: <StatusBadge type="success" label="فعال" /> }
  ];

  const columns = [
    { header: 'نوع الاشتراك', accessorKey: 'name' },
    { header: 'تاريخ التسليم القادم', accessorKey: 'date' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="اشتراك صندوق الرحلة" action={{ label: 'إدارة الاشتراك', href: '#' }} />
      <SimpleDataTable columns={columns} data={data} />
    </div>
  );
}
