import { getSessions } from '@/data/domains/writing';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { formatCairo } from '@/lib/timezone';
import { AccountBookingsClient, type BookingRow } from './AccountBookingsClient';

export const dynamic = 'force-dynamic';

const STATUS: Record<string, { label: string; className: string }> = {
  pending:   { label: 'بانتظار تثبيت الموعد', className: 'bg-amber-100 text-amber-900 border border-amber-200' },
  confirmed: { label: 'مؤكدة',                className: 'bg-emerald-100 text-emerald-900 border border-emerald-200' },
  completed: { label: 'تمت',                  className: 'bg-slate-100 text-slate-700 border border-slate-200' },
  cancelled: { label: 'ملغاة',                className: 'bg-rose-100 text-rose-800 border border-rose-200' },
};

export default async function BookingsPage() {
  const sessions = await getSessions();

  const rows: BookingRow[] = sessions.map((session) => {
    const status = STATUS[session.status] ?? {
      label: session.status,
      className: 'bg-slate-100 text-slate-700 border border-slate-200',
    };

    return {
      id: session.id,
      referenceDisplay: session.paymentReference ?? '—',
      sessionDisplay: `جلسة ${session.sessionNumber}`,
      dateDisplay: formatCairo(session.scheduledAt, {
        dateStyle: 'long',
        timeStyle: 'short',
      }),
      packageDisplay: session.packageName ?? '—',
      status: session.status,
      rawScheduledAt: session.scheduledAt,
      statusLabel: status.label,
      statusClass: status.className,
    };
  });

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="المواعيد والجلسات" />
      <AccountBookingsClient initialRows={rows} />
    </div>
  );
}
