'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser, requireAdmin } from '@/lib/auth-guard';
import { logAuditAction } from '@/lib/audit';
import { notifyAdmins } from '@/lib/notifications';

/**
 * طلبات حذف الحساب.
 *
 * ليه طلب مش حذف فوري (قرارك):
 *   الحساب ممكن يكون عليه طلبات مدفوعة أو مستحقات أو حجوزات جارية،
 *   وحذفه في اللحظة بيسيب سجلات بلا صاحب. فالعميل بيطلب، والإدارة
 *   بتراجع وتنفّذ.
 *
 * ⚠️ الملف ده **ما بيحذفش** حسابات. بيسجّل الطلب ويقفله بعد ما تتعامل
 * معاه يدويًا. الحذف الفعلي بيتم من لوحة Supabase عن قصد: عملية مالهاش
 * رجعة ما ينفعش تتعمل بزرار في صفحة ويب.
 */
export type DeletionResult = { ok: true } | { ok: false; error: string };

export async function requestAccountDeletion(reason: string): Promise<DeletionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('account_deletion_requests')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    return { ok: false, error: 'عندك طلب حذف قيد المراجعة بالفعل' };
  }

  const { error } = await supabase.from('account_deletion_requests').insert({
    user_id: user.id,
    reason: reason.trim() || null,
    status: 'pending',
  });

  if (error) {
    console.error('Error filing deletion request', error);
    return { ok: false, error: `تعذّر إرسال الطلب: ${error.message}` };
  }

  await logAuditAction({
    actorProfileId: user.id,
    actorName: user.fullName,
    action: 'account_deletion_requested',
    entityType: 'UserProfile',
    entityId: user.id,
  });

  await notifyAdmins({
    event: 'account_deletion',
    title: 'طلب حذف حساب',
    message: `${user.fullName} طلب حذف حسابه.`,
    link: '/dashboard/admin/users/deletion-requests',
  });

  revalidatePath('/account');
  revalidatePath('/dashboard/admin/users/deletion-requests');
  return { ok: true };
}

/** الإدارة بتقفل الطلب بعد ما تتعامل معاه، أو ترفضه بسبب. */
export async function resolveDeletionRequest(params: {
  id: string;
  status: 'done' | 'rejected';
  adminNotes?: string;
}): Promise<DeletionResult> {
  const admin = await requireAdmin('canManageUsers', 'غير مصرح لك بإدارة الحسابات');

  if (params.status === 'rejected' && !params.adminNotes?.trim()) {
    return { ok: false, error: 'اكتب سبب الرفض — العميل المفروض يعرف' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('account_deletion_requests')
    .update({
      status: params.status,
      admin_notes: params.adminNotes?.trim() || null,
      handled_at: new Date().toISOString(),
      handled_by: admin.id,
    })
    .eq('id', params.id);

  if (error) {
    console.error('Error resolving deletion request', error);
    return { ok: false, error: `تعذّر التحديث: ${error.message}` };
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: 'account_deletion_resolved',
    entityType: 'AccountDeletionRequest',
    entityId: params.id,
    metadata: { status: params.status },
  });

  revalidatePath('/dashboard/admin/users/deletion-requests');
  return { ok: true };
}
