'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser, getDependentGuardian } from '@/lib/auth-guard';
import { notifyUser } from '@/lib/notifications';
import { logAuditAction } from '@/lib/audit';

/**
 * طلبات الأبناء — «الطفل عايز إيه»، وولي الأمر بيبتّ.
 *
 * ── ليه المسار ده ───────────────────────────────────────────
 *
 * حساب الطفل كان يقدر يشتري ويحجز زي أي عميل، لأن **ولا دالة في
 * المشروع بتفرّق بين `student` و`customer`**. اتقفل الطريق المباشر،
 * والمقصود مش المنع: الطفل يطلب، وولي الأمر يوافق أو يعدّل، وبعدين
 * الدفع.
 *
 * ── الموافقة مابتعملش الطلب ─────────────────────────────────
 *
 * الموافقة بتوصّل ولي الأمر لنفس شاشة الطلب العادية بالبيانات جاهزة،
 * ويكمّل الدفع زي أي عملية. كده مسار الشراء **واحد** — لو الموافقة
 * كانت بتعمل الطلب بنفسها، كان بقى عندنا مسارين للشراء يتفرّعوا
 * ويختلفوا مع الوقت.
 */

export type RequestResult = { ok: true } | { ok: false; error: string };

/** رابط الشاشة اللي ولي الأمر بيكمّل منها بعد الموافقة. */
export type ApprovedTarget = { ok: true; href: string } | { ok: false; error: string };

/**
 * الطفل بيطلب.
 *
 * لازم يكون حساب طفل تابع فعلًا — ولي الأمر عنده أزراره العادية
 * ومش محتاج يمر من هنا.
 */
export async function createDependentRequest(params: {
  kind: 'service' | 'package';
  serviceId?: string | null;
  providerId?: string | null;
  packageId?: string | null;
  instructorId?: string | null;
  note?: string;
}): Promise<RequestResult> {
  const user = await requireUser();
  const dependent = await getDependentGuardian();

  if (!dependent) {
    return { ok: false, error: 'الصفحة دي لحسابات الأبناء. اطلب من حسابك مباشرةً.' };
  }

  if (params.kind === 'service' && !params.serviceId) {
    return { ok: false, error: 'الخدمة مش محددة' };
  }
  if (params.kind === 'package' && !params.packageId) {
    return { ok: false, error: 'الباقة مش محددة' };
  }

  const supabase = await createClient();

  // طلب واحد معلّق لنفس الحاجة يكفي — عشان لوحة ولي الأمر ما تتملاش
  // بنفس الطلب عشر مرات.
  const { data: existing } = await supabase
    .from('dependent_requests')
    .select('id')
    .eq('child_profile_id', dependent.childId)
    .eq('status', 'pending')
    .eq(params.kind === 'service' ? 'service_id' : 'package_id',
        (params.kind === 'service' ? params.serviceId : params.packageId) as string)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: 'بعتّ الطلب ده قبل كده وولي أمرك لسه بيراجعه.' };
  }

  const { data: created, error } = await supabase
    .from('dependent_requests')
    .insert({
      child_profile_id: dependent.childId,
      guardian_profile_id: dependent.guardianId,
      requester_profile_id: user.id,
      kind: params.kind,
      service_id: params.kind === 'service' ? params.serviceId : null,
      provider_id: params.kind === 'service' ? (params.providerId ?? null) : null,
      package_id: params.kind === 'package' ? params.packageId : null,
      instructor_id: params.kind === 'package' ? (params.instructorId ?? null) : null,
      note: params.note?.trim() || null,
      status: 'pending',
    })
    .select('id');

  if (error) {
    console.error('Error creating dependent request', error);
    return { ok: false, error: `تعذّر إرسال الطلب: ${error.message}` };
  }
  if (!created || created.length === 0) {
    return { ok: false, error: 'الطلب مروّحش للقاعدة — كلّم ولي أمرك.' };
  }

  await notifyUser({
    event: 'service_order_new',
    recipientProfileId: dependent.guardianId,
    title: `طلب جديد من ${dependent.fullName}`,
    message: params.note?.trim()
      ? `«${params.note.trim()}»`
      : 'في طلب مستني مراجعتك في المركز العائلي.',
    link: '/account/family/requests',
  });

  revalidatePath('/account/family/requests');
  return { ok: true };
}

/** الطفل يسحب طلبه قبل ما ولي الأمر يبتّ. */
export async function cancelDependentRequest(requestId: string): Promise<RequestResult> {
  const user = await requireUser();
  const dependent = await getDependentGuardian();
  if (!dependent) return { ok: false, error: 'غير مصرح' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dependent_requests')
    .update({ status: 'cancelled', decided_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('child_profile_id', dependent.childId)
    .eq('status', 'pending')
    .select('id');

  if (error) {
    console.error('Error cancelling dependent request', error);
    return { ok: false, error: `تعذّر سحب الطلب: ${error.message}` };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: 'الطلب مش موجود أو ولي أمرك بتّ فيه خلاص.' };
  }

  revalidatePath('/account/family/requests');
  return { ok: true };
}

/** الطلب ده تخص ولي الأمر الداخل دلوقتي؟ */
async function loadGuardianRequest(requestId: string) {
  const guardian = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from('dependent_requests')
    .select('*, child_profiles(full_name, account_profile_id)')
    .eq('id', requestId)
    .eq('guardian_profile_id', guardian.id)
    .maybeSingle();

  if (!data) throw new Error('الطلب ده مش على حسابك');
  return { guardian, request: data, supabase };
}

/**
 * ولي الأمر بيوافق.
 *
 * مابيعملش الطلب — بيقفل طلب الابن ويرجّع رابط شاشة الطلب العادية
 * بالبيانات جاهزة، عشان يكمّل الدفع من نفس المسار اللي أي عميل بيمر
 * منه.
 *
 * **التعديل قبل الموافقة**: ولي الأمر يقدر يبعت مقدّم خدمة أو مدرب
 * مختلف عن اللي الابن طلبه — الرابط بيتبني على اللي هو اختاره.
 */
export async function approveDependentRequest(
  requestId: string,
  overrides?: { providerId?: string | null; instructorId?: string | null },
): Promise<ApprovedTarget> {
  let ctx;
  try {
    ctx = await loadGuardianRequest(requestId);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'غير مصرح' };
  }
  const { guardian, request, supabase } = ctx;

  if (request.status !== 'pending') {
    return { ok: false, error: 'الطلب ده اتبتّ فيه خلاص' };
  }

  const { data: updated, error } = await supabase
    .from('dependent_requests')
    .update({ status: 'approved', decided_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('status', 'pending')
    .select('id');

  if (error) {
    console.error('Error approving dependent request', error);
    return { ok: false, error: `تعذّر قبول الطلب: ${error.message}` };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, error: 'الطلب اتغيّر قبل ما توافق — حدّث الصفحة.' };
  }

  const child = request.child_profiles as { full_name: string; account_profile_id: string | null } | null;

  if (child?.account_profile_id) {
    await notifyUser({
      event: 'service_order_new',
      recipientProfileId: child.account_profile_id,
      title: 'ولي أمرك وافق على طلبك',
      message: 'جاري استكمال الطلب.',
      link: '/dashboard/student',
    });
  }

  await logAuditAction({
    actorProfileId: guardian.id,
    actorName: guardian.fullName,
    action: 'dependent_request_approved',
    entityType: 'DependentRequest',
    entityId: requestId,
  });

  revalidatePath('/account/family/requests');

  // الرابط بيروح لنفس شاشة الطلب العادية. المستفيد بيتحدد هناك،
  // والدفع بيمشي زي أي عملية.
  if (request.kind === 'service') {
    const providerId = overrides?.providerId ?? request.provider_id;
    const query = providerId ? `?provider=${encodeURIComponent(providerId)}` : '';
    return {
      ok: true,
      href: `/creative-writing/services/${request.service_id}/order${query}`,
    };
  }

  const params = new URLSearchParams({ package: String(request.package_id) });
  const instructorId = overrides?.instructorId ?? request.instructor_id;
  if (instructorId) params.set('instructor', instructorId);
  return { ok: true, href: `/creative-writing/booking/confirm?${params.toString()}` };
}

/** ولي الأمر بيرفض، ومعاه سبب يوصل للابن. */
export async function rejectDependentRequest(
  requestId: string,
  guardianNote: string,
): Promise<RequestResult> {
  let ctx;
  try {
    ctx = await loadGuardianRequest(requestId);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'غير مصرح' };
  }
  const { guardian, request, supabase } = ctx;

  if (request.status !== 'pending') {
    return { ok: false, error: 'الطلب ده اتبتّ فيه خلاص' };
  }

  const note = guardianNote.trim();
  if (!note) {
    return { ok: false, error: 'اكتب سبب مختصر — الابن هيقراه.' };
  }

  const { data: updated, error } = await supabase
    .from('dependent_requests')
    .update({
      status: 'rejected',
      guardian_note: note,
      decided_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('status', 'pending')
    .select('id');

  if (error) {
    console.error('Error rejecting dependent request', error);
    return { ok: false, error: `تعذّر رفض الطلب: ${error.message}` };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, error: 'الطلب اتغيّر قبل ما ترد — حدّث الصفحة.' };
  }

  const child = request.child_profiles as { account_profile_id: string | null } | null;
  if (child?.account_profile_id) {
    await notifyUser({
      event: 'service_order_new',
      recipientProfileId: child.account_profile_id,
      title: 'رد على طلبك',
      message: note,
      link: '/dashboard/student',
    });
  }

  await logAuditAction({
    actorProfileId: guardian.id,
    actorName: guardian.fullName,
    action: 'dependent_request_rejected',
    entityType: 'DependentRequest',
    entityId: requestId,
  });

  revalidatePath('/account/family/requests');
  return { ok: true };
}
