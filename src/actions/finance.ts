'use server';
import { requireSuperAdmin as requireSuperAdminGuard, requireAdmin } from '@/lib/auth-guard';

import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/data/domains/auth';
import { getMyInstructorId } from '@/data/domains/services';

/**
 * Money operations: marking a payout as paid, an instructor's withdrawal
 * request, and the publisher pricing formula.
 *
 * Every action here used to change an in-memory object and return success, so
 * "تم الدفع" was never recorded anywhere and a withdrawal request reached
 * nobody. They now write to the database, and row-level security is the real
 * guard behind the checks made here.
 */

/** يفوّض للقاعدة الموحّدة في `@/lib/auth-guard`. */
async function requireSuperAdmin() {
  return requireSuperAdminGuard('غير مصرح لك بإدارة المدفوعات');
}

export async function markInstructorPayoutAsPaid(payoutId: string) {
  const user = await requireSuperAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('instructor_payouts')
    .update({ status: 'paid', updated_at: new Date().toISOString() })
    .eq('id', payoutId)
    .select('id, instructor_id, amount, status')
    .maybeSingle();

  if (error) {
    console.error('Error marking instructor payout as paid', error);
    throw new Error('تعذّر تسجيل الدفع');
  }

  if (!data) {
    throw new Error('سجل الدفعة غير موجود أو تعذّر تحديثه');
  }

  await logAuditAction({
    actorName: user.fullName,
    actorProfileId: user.id,
    action: 'instructor_payout_marked_paid',
    entityType: 'instructor_payout',
    entityId: payoutId,
    metadata: { instructorId: data.instructor_id, amount: data.amount },
  });

  revalidatePath('/dashboard/admin/finance/instructor-payouts');
  revalidatePath(`/dashboard/admin/finance/instructor-payouts/${payoutId}`);
  revalidatePath('/dashboard/instructor/payouts');
  return { success: true };
}

export async function markPublisherPayoutAsPaid(payoutId: string) {
  const user = await requireSuperAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('publisher_payouts')
    .update({ status: 'paid', updated_at: new Date().toISOString() })
    .eq('id', payoutId)
    .select('id, publisher_id, amount, status')
    .maybeSingle();

  if (error) {
    console.error('Error marking publisher payout as paid', error);
    throw new Error('تعذّر تسجيل الدفع');
  }

  if (!data) {
    throw new Error('سجل الدفعة غير موجود أو تعذّر تحديثه');
  }

  await logAuditAction({
    actorName: user.fullName,
    actorProfileId: user.id,
    action: 'publisher_payout_marked_paid',
    entityType: 'publisher_payout',
    entityId: payoutId,
    metadata: { publisherId: data.publisher_id, amount: data.amount },
  });

  revalidatePath('/dashboard/admin/finance/publisher-payouts');
  revalidatePath(`/dashboard/admin/finance/publisher-payouts/${payoutId}`);
  return { success: true };
}

/**
 * An instructor asking to withdraw what they have earned.
 *
 * The instructor is resolved here from the signed-in user rather than taken
 * from the browser, so a request can only ever be filed for oneself.
 */
export async function submitWithdrawalRequest(amount: number, method: string) {
  const user = await getCurrentUser();
  if (user.role !== 'instructor') {
    throw new Error('غير مصرح لك بتقديم طلب سحب');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('المبلغ غير صحيح');
  }

  const instructorId = await getMyInstructorId();
  if (!instructorId) {
    throw new Error('لم يتم العثور على ملف المدرب');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .insert({ instructor_id: instructorId, amount, method, status: 'pending' })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Error submitting withdrawal request', error);
    throw new Error('تعذّر إرسال طلب السحب');
  }

  await logAuditAction({
    actorName: user.fullName,
    actorProfileId: user.id,
    action: 'instructor_withdrawal_requested',
    entityType: 'withdrawal_request',
    entityId: data.id,
    metadata: { instructorId, amount, method },
  });

  revalidatePath('/dashboard/instructor/payouts');
  revalidatePath('/dashboard/admin/finance');
  return { success: true };
}

export async function updatePublisherPricingSettings(multiplier: number, fixedFee: number) {
  const user = await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('pricing_formula_settings')
    .update({
      platform_multiplier: multiplier,
      fixed_admin_fee: fixedFee,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'publisher-default');

  if (error) {
    console.error('Error updating publisher pricing settings', error);
    throw new Error('تعذّر حفظ إعدادات التسعير');
  }

  await logAuditAction({
    actorName: user.fullName,
    actorProfileId: user.id,
    action: 'publisher_pricing_settings_updated',
    entityType: 'settings',
    entityId: 'publisher-default',
    metadata: { multiplier, fixedFee },
  });

  revalidatePath('/dashboard/admin/settings/publisher-pricing');
  revalidatePath('/dashboard/admin/products');
  return { success: true };
}
