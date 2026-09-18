'use server';
import { requireAdmin } from '@/lib/auth-guard';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';
import { notifyUser, getInstructorUserId } from '@/lib/notifications';

/**
 * Deciding on an instructor's withdrawal request.
 *
 * Instructors could file a request and the admin dashboard counted them, but
 * there was no screen to open one — so a request sat unanswered for ever while
 * the instructor waited for their money.
 */
export async function setWithdrawalStatus(params: {
  requestId: string;
  status: 'approved' | 'paid' | 'rejected';
  adminNotes?: string;
}) {
  const admin = await requireAdmin('canManageFinance', 'غير مصرح لك بإدارة طلبات السحب');

  const { requestId, status, adminNotes } = params;
  if (status === 'rejected' && !adminNotes?.trim()) {
    throw new Error('اكتب سبب الرفض ليصل للمدرب');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .update({
      status,
      admin_notes: adminNotes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select('instructor_id, amount')
    .single();

  if (error || !data) {
    console.error('Error updating withdrawal request', error);
    throw new Error('تعذّر تحديث الطلب');
  }

  const titles: Record<string, string> = {
    approved: 'تم اعتماد طلب السحب',
    paid: 'تم تحويل مستحقاتك',
    rejected: 'لم يُعتمد طلب السحب',
  };

  await notifyUser({
    event: 'withdrawal',
    recipientProfileId: await getInstructorUserId(data.instructor_id),
    title: titles[status],
    message: adminNotes?.trim(),
    link: '/dashboard/instructor/payouts',
  });

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: `withdrawal_${status}`,
    entityType: 'WithdrawalRequest',
    entityId: requestId,
    metadata: { amount: data.amount, notes: adminNotes ?? null },
  });

  revalidatePath('/dashboard/admin/finance/withdrawals');
  revalidatePath('/dashboard/instructor/payouts');
  revalidatePath('/dashboard/admin');
  return { ok: true };
}
