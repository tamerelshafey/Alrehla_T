'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/data/domains/auth';
import { hasAdminPermission } from '@/lib/utils';
import { logAuditAction } from '@/lib/audit';

/**
 * Deciding on an application to join as an instructor or publisher.
 *
 * The admin screen had "قبول الطلب" and "رفض الطلب" buttons with no handler at
 * all, so every application stayed `pending` for ever however many times an
 * admin clicked.
 */
export async function setJoinRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected'
) {
  const admin = await getCurrentUser();
  if (!hasAdminPermission(admin, 'canManageSupport')) {
    throw new Error('غير مصرح لك بإدارة طلبات الانضمام');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('join_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId);

  if (error) {
    console.error('Error updating join request', error);
    throw new Error('تعذّر تحديث حالة الطلب');
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: status === 'approved' ? 'join_request_approved' : 'join_request_rejected',
    entityType: 'JoinRequest',
    entityId: requestId,
  });

  revalidatePath(`/dashboard/admin/join-requests/${requestId}`);
  revalidatePath('/dashboard/admin/join-requests');
  revalidatePath('/dashboard/admin');
  return { success: true };
}
