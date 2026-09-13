import { redirect } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatPrice } from '@/lib/utils';
import { getCurrentUser } from '@/data/domains/auth';
import {
  getMyInstructorId,
  getStandaloneServices,
  getInstructorServiceOffers,
  getServiceOrdersForInstructor,
} from '@/data/domains/services';

export const dynamic = 'force-dynamic';

const OFFER_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'neutral' }> = {
  approved: { label: 'معتمدة', type: 'success' },
  pending: { label: 'قيد المراجعة', type: 'warning' },
  rejected: { label: 'مرفوضة', type: 'neutral' },
};

const ORDER_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'neutral' }> = {
  paid: { label: 'مدفوع', type: 'success' },
  awaiting_verification: { label: 'بانتظار تأكيد الدفع', type: 'warning' },
  pending: { label: 'قيد الانتظار', type: 'warning' },
  refunded: { label: 'مسترجع', type: 'neutral' },
};

export default async function InstructorServicesPage() {
  const user = await getCurrentUser();
  if (user.role !== 'instructor') {
    redirect('/dashboard');
  }

  const instructorId = await getMyInstructorId();

  if (!instructorId) {
    return (
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <DashboardPageHeader title="الخدمات الإبداعية" backHref="/dashboard/instructor" />
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-16 text-center">
          <p className="text-lg font-bold text-slate-500">
            لم يتم ربط حسابك بملف مدرب بعد.
          </p>
          <p className="mt-2 text-slate-400">تواصل مع الإدارة لاستكمال بياناتك.</p>
        </div>
      </div>
    );
  }

  const [services, offers, orders] = await Promise.all([
    getStandaloneServices(),
    getInstructorServiceOffers(instructorId),
    getServiceOrdersForInstructor(instructorId),
  ]);

  const offerRows = offers.map((offer) => {
    const service = services.find((s) => s.id === offer.serviceId);
    const status = offer.isActive
      ? OFFER_STATUS[offer.status] ?? { label: offer.status, type: 'warning' as const }
      : { label: 'موقوفة', type: 'neutral' as const };
    return {
      id: offer.id,
      serviceName: service?.name ?? offer.serviceId,
      price: offer.approvedPrice != null ? formatPrice(offer.approvedPrice) : '—',
      statusDisplay: <StatusBadge type={status.type} label={status.label} />,
    };
  });

  const offerColumns = [
    { header: 'الخدمة', accessorKey: 'serviceName' },
    { header: 'سعرك', accessorKey: 'price' },
    { header: 'الحالة', accessorKey: 'statusDisplay' },
  ];

  const orderRows = orders.map((order) => {
    const status = ORDER_STATUS[order.status] ?? { label: order.status, type: 'warning' as const };
    return {
      id: order.id,
      serviceName: order.serviceName,
      date: formatDate(order.createdAt),
      amount: formatPrice(order.amount),
      statusDisplay: <StatusBadge type={status.type} label={status.label} />,
    };
  });

  const orderColumns = [
    { header: 'الخدمة', accessorKey: 'serviceName' },
    { header: 'تاريخ الطلب', accessorKey: 'date' },
    { header: 'المبلغ', accessorKey: 'amount' },
    { header: 'الحالة', accessorKey: 'statusDisplay' },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-6 py-12">
      <div>
        <DashboardPageHeader title="الخدمات التي تقدّمها" backHref="/dashboard/instructor" />
        <p className="mt-2 font-medium text-slate-500">
          الخدمات الإبداعية المسندة إليك وسعرك في كل منها. الأسعار تُعتمد من الإدارة — تواصل
          معها لتعديل أي سعر.
        </p>
        <div className="mt-4">
          <SimpleDataTable columns={offerColumns} data={offerRows} />
        </div>
      </div>

      <div>
        <DashboardPageHeader title="طلبات الخدمات" />
        <p className="mt-2 font-medium text-slate-500">الطلبات التي اختارك فيها العملاء.</p>
        <div className="mt-4">
          <SimpleDataTable columns={orderColumns} data={orderRows} />
        </div>
      </div>
    </div>
  );
}
