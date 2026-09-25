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
 * المدرب بيطلب سحب مستحقاته.
 *
 * ── ثلاث مشاكل كانت هنا ─────────────────────────────────────
 *
 * **١. المبلغ كان جاي من المتصفح.** الشاشة بتحسب الرصيد وبتبعته،
 * والخادم بياخده زي ما هو ويكتبه. يعني تبويبة متلاعب فيها تقدر تطلب
 * **أي رقم**، والحارس الوحيد إن إداري يبص على الطلب قبل ما يدفع.
 *
 * ودي مخالفة لقاعدة ماشي عليها المشروع كله: دالة إنشاء الطلب بتجيب
 * السعر من جدول المنتجات، ودالة الحجز بتجيبه من الباقة، ودالة
 * المستحق بتحسبه من صف الطلب. **المتصفح مبيبعتش أرقام فلوس.**
 *
 * دلوقتي المبلغ بيتحسب هنا من `instructor_payouts` — والباراميتر
 * اتشال أصلًا عشان محدش يفتكر إنه لسه بيتبعت.
 *
 * **٢. مفيش منع للتكرار.** المدرب يدوس مرتين فيطلع طلبين بنفس
 * الرصيد، والإدارة تشوف صفّين وتفتكرهم مستحقين.
 *
 * **٣. الرصيد الصفر كان بيعدّي.** مدرب لسه مالوش مستحقات يقدر
 * يبعت طلب سحب بصفر.
 *
 * ⚠️ **ولسه مفيش قيد في القاعدة على المبلغ** (`CHECK (amount > 0)`
 *    وبس). الفحص هنا حارس تطبيق لا حارس قاعدة — ولو اتفتح طريق تاني
 *    لإنشاء طلبات السحب يومًا، لازم يمر من هنا أو يتكتب له نفس المنطق.
 */
export type WithdrawalResult =
  | { ok: true; amount: number }
  | { ok: false; error: string };

export async function submitWithdrawalRequest(
  method: string,
  payoutDetails: string,
): Promise<WithdrawalResult> {
  const user = await getCurrentUser();
  if (user.role !== 'instructor') {
    return { ok: false, error: 'غير مصرح لك بتقديم طلب سحب' };
  }

  // ⚠️ **بيانات التحويل كانت بتضيع.** خانات «اسم البنك» و«رقم
  //    الحساب» في الشاشة مكانتش مربوطة بأي حالة ومبتتبعتش للخادم —
  //    مكتوب عليها `required` بس، فالمدرب بيملاها والمتصفح يسمحله
  //    والخادم ياخد `method` وحده.
  //
  //    فالإدارة بتشوف «تحويل بنكي» **من غير رقم حساب**: طلب وصل
  //    ومينفعش يتنفّذ، ولازم حد يكلّم المدرب يسأله.
  const details = payoutDetails.trim();
  if (!details) {
    return { ok: false, error: 'اكتب بيانات التحويل — من غيرها الطلب مش هينفّذ.' };
  }
  if (details.length > 600) {
    return { ok: false, error: 'بيانات التحويل طويلة أوي — اختصرها.' };
  }

  const instructorId = await getMyInstructorId();
  if (!instructorId) {
    return { ok: false, error: 'لم يتم العثور على ملف المدرب' };
  }

  const supabase = await createClient();

  // ── الرصيد: من القاعدة لا من الشاشة ───────────────────────
  const { data: earnings, error: earningsError } = await supabase
    .from('instructor_payouts')
    .select('amount')
    .eq('instructor_id', instructorId)
    .eq('status', 'pending');

  if (earningsError) {
    console.error('Error reading instructor earnings', earningsError);
    return { ok: false, error: 'تعذّر قراءة رصيدك — جرّب تاني.' };
  }

  const available = (earnings ?? []).reduce((sum, row) => sum + (row.amount ?? 0), 0);

  if (available <= 0) {
    return { ok: false, error: 'مفيش رصيد قابل للسحب دلوقتي.' };
  }

  // ── طلب معلّق واحد يكفي ───────────────────────────────────
  const { data: openRequests, error: openError } = await supabase
    .from('withdrawal_requests')
    .select('id')
    .eq('instructor_id', instructorId)
    .eq('status', 'pending')
    .limit(1);

  if (openError) {
    console.error('Error reading open withdrawal requests', openError);
    return { ok: false, error: 'تعذّر التحقق من طلباتك السابقة — جرّب تاني.' };
  }

  if (openRequests && openRequests.length > 0) {
    return {
      ok: false,
      error: 'عندك طلب سحب مستني المراجعة خلاص. استنى الرد عليه الأول.',
    };
  }

  const { data, error } = await supabase
    .from('withdrawal_requests')
    .insert({
      instructor_id: instructorId,
      amount: available,
      method,
      payout_details: details,
      status: 'pending',
    })
    .select('id')
    .maybeSingle();

  if (error || !data) {
    // ⚠️ نص خطأ القاعدة إنجليزي ومبهم للمدرب، فبيتسجّل ومبيتعرضش.
    console.error('Error submitting withdrawal request', error);
    return { ok: false, error: 'تعذّر إرسال طلب السحب — جرّب تاني، ولو فضلت كلّم الإدارة.' };
  }

  await logAuditAction({
    actorName: user.fullName,
    actorProfileId: user.id,
    action: 'instructor_withdrawal_requested',
    entityType: 'withdrawal_request',
    entityId: data.id,
    metadata: { instructorId, amount: available, method },
  });

  revalidatePath('/dashboard/instructor/payouts');
  revalidatePath('/dashboard/admin/finance');
  return { ok: true, amount: available };
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
