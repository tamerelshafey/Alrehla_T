import { getSessions } from '@/data/domains/writing';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { formatCairo } from '@/lib/timezone';

/**
 * «المواعيد والجلسات» عند العميل.
 *
 * كانت بتعرض تلات قيم خام:
 *   • «رقم الحجز» ← معرّف الجلسة الداخلي (UUID)، وهو مش رقم الحجز أصلًا
 *   • «الباقة»   ← `package_id` زي «pkg-3»
 *   • «الحالة»   ← `pending` بالإنجليزي
 *
 * دلوقتي: الرقم المرجعي اللي العميل كتبه في التحويل، واسم الباقة،
 * وحالة بالعربي، ومعاهم ساعة الجلسة — الصف كان بيقول التاريخ من غير
 * الساعة، وهي أهم حاجة في ميعاد.
 */

const STATUS: Record<string, { label: string; className: string }> = {
  pending:   { label: 'بانتظار تثبيت الموعد', className: 'bg-amber-50 text-amber-700' },
  confirmed: { label: 'مؤكدة',                className: 'bg-emerald-50 text-emerald-700' },
  completed: { label: 'تمت',                  className: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'ملغاة',                className: 'bg-rose-50 text-rose-700' },
};

export default async function BookingsPage() {
  const sessions = await getSessions();

  const rows = sessions.map((session) => {
    const status = STATUS[session.status] ?? {
      label: session.status,
      className: 'bg-slate-100 text-slate-600',
    };

    return {
      ...session,
      referenceDisplay: session.paymentReference ?? '—',
      sessionDisplay: `جلسة ${session.sessionNumber}`,
      dateDisplay: formatCairo(session.scheduledAt, {
        dateStyle: 'long',
        timeStyle: 'short',
      }),
      packageDisplay: session.packageName ?? '—',
      statusDisplay: (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${status.className}`}>
          {status.label}
        </span>
      ),
    };
  });

  const columns = [
    { header: 'رقم الحجز', accessorKey: 'referenceDisplay' },
    { header: 'الجلسة', accessorKey: 'sessionDisplay' },
    { header: 'الموعد', accessorKey: 'dateDisplay' },
    { header: 'الباقة', accessorKey: 'packageDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' },
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="المواعيد والجلسات" />
      <SimpleDataTable columns={columns} data={rows} />
      {rows.length === 0 && (
        <p className="rounded-2xl border border-slate-200 bg-white py-12 text-center font-medium text-slate-500">
          لا توجد مواعيد بعد.
        </p>
      )}
    </div>
  );
}
