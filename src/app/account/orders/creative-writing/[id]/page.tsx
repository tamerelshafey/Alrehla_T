import { notFound } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { ServiceOrderDetail } from '@/components/services/ServiceOrderDetail';
import { getCurrentUser } from '@/data/domains/auth';
import { getServiceOrderDetail, getServiceOrderMessages } from '@/data/domains/services';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  // Row-level security already limits this read to the buyer, the assigned
  // instructor and admins, so "not found" covers "not yours" too.
  const order = await getServiceOrderDetail(id);
  if (!order || order.buyerProfileId !== user.id) notFound();

  const messages = await getServiceOrderMessages(id);

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="تفاصيل الطلب" backHref="/account/orders/creative-writing" />
      <ServiceOrderDetail
        order={order}
        messages={messages}
        viewer="customer"
        currentProfileId={user.id}
      />
    </div>
  );
}
