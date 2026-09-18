'use server';
import { requireAdmin } from '@/lib/auth-guard';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';
import { notifyUser } from '@/lib/notifications';
import type { Database } from '@/types/supabase';

/**
 * Moving a store order through fulfilment.
 *
 * Order status used to stop at "مدفوع": there was no shipped or delivered
 * state at all, and the "تحديث حالة الشحن" button had no handler. A customer
 * who paid for a printed book had no way of knowing whether it had been sent.
 */

const FLOW: Record<string, string> = {
  preparing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

/** يفوّض للقاعدة الموحّدة في `@/lib/auth-guard` — التنفيذ واحد، والرسالة خاصة بهذا المجال. */
async function requireOrdersAdmin() {
  return requireAdmin('canManageOrders', 'غير مصرح لك بإدارة الطلبات');
}

export async function setOrderFulfilmentStatus(params: {
  orderId: string;
  status: 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  trackingReference?: string;
  note?: string;
}) {
  const admin = await requireOrdersAdmin();
  const { orderId, status, trackingReference, note } = params;

  if (status === 'cancelled' && !note?.trim()) {
    throw new Error('اكتب سبب الإلغاء');
  }

  const supabase = await createClient();

  const update: Database['public']['Tables']['orders']['Update'] = { status };
  if (status === 'shipped') update.shipped_at = new Date().toISOString();
  if (status === 'delivered') update.delivered_at = new Date().toISOString();
  if (trackingReference !== undefined) {
    update.tracking_reference = trackingReference.trim() || null;
  }
  if (note?.trim()) update.admin_notes = note.trim();

  const { data, error } = await supabase
    .from('orders')
    .update(update)
    .eq('id', orderId)
    .select('user_id')
    .single();

  if (error || !data) {
    console.error('Error updating order fulfilment', error);
    throw new Error('تعذّر تحديث حالة الطلب');
  }

  await notifyUser({
    event: 'order_status',
    recipientProfileId: data.user_id,
    title: `طلبك: ${FLOW[status]}`,
    message:
      status === 'shipped' && trackingReference?.trim()
        ? `رقم الشحنة: ${trackingReference.trim()}`
        : note?.trim(),
    link: '/account/orders/enha-lak',
  });

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: `order_marked_${status}`,
    entityType: 'Order',
    entityId: orderId,
    metadata: { status, trackingReference: trackingReference ?? null, note: note ?? null },
  });

  revalidatePath(`/dashboard/admin/orders/${orderId}`);
  revalidatePath('/dashboard/admin/orders');
  revalidatePath('/account/orders/enha-lak');
  return { ok: true };
}
