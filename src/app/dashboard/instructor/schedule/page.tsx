import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { getAvailabilitySlots } from '@/data/mock';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function InstructorSchedulePage() {
  const slots = await getAvailabilitySlots();

  const formattedSlots = slots.map(slot => ({
    ...slot,
    statusDisplay: slot.isBooked ? (
      <StatusBadge type="warning" label="محجوز" />
    ) : (
      <StatusBadge type="success" label="متاح" />
    )
  }));

  const columns = [
    { header: 'اليوم', accessorKey: 'dayLabel' },
    { header: 'الوقت', accessorKey: 'timeLabel' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title="الجدول والمواعيد" 
        backHref="/dashboard/instructor"
      />
      <SimpleDataTable columns={columns} data={formattedSlots} />
    </div>
  );
}
