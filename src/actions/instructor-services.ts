'use server';
import { requireAdmin } from '@/lib/auth-guard';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/data/domains/auth';
import { getMyInstructorId } from '@/data/domains/services';
import { notifyUser, getInstructorUserId } from '@/lib/notifications';

/**
 * Admin-only management of which instructor provides which creative service,
 * and for how much.
 *
 * Authorisation is checked twice on purpose: here, so the caller gets a clear
 * error, and again by row-level security on `instructor_services`, which only
 * admins may write. The app-level check alone has been the weak point in this
 * codebase before — it is never the only guard.
 */

/** يفوّض للقاعدة الموحّدة في `@/lib/auth-guard` — التنفيذ واحد، والرسالة خاصة بهذا المجال. */
async function requireInstructorAdmin() {
  return requireAdmin('canManageCatalog', 'غير مصرح لك بإدارة عروض المدربين');
}

export async function saveInstructorServiceOffer(params: {
  instructorId: string;
  serviceId: string;
  approvedPrice: number | null;
  isActive: boolean;
  adminNotes?: string;
}) {
  await requireInstructorAdmin();
  const supabase = await createClient();

  const { instructorId, serviceId, approvedPrice, isActive, adminNotes } = params;

  // A price is what makes the offer real; without one it stays pending so it
  // never reaches a visitor half-configured.
  const status = approvedPrice != null && approvedPrice > 0 ? 'approved' : 'pending';

  const { error } = await supabase
    .from('instructor_services')
    .upsert(
      {
        instructor_id: instructorId,
        service_id: serviceId,
        approved_price: approvedPrice,
        status,
        is_active: isActive,
        admin_notes: adminNotes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'instructor_id,service_id' }
    );

  if (error) {
    console.error('Error saving instructor service offer', error);
    throw new Error('تعذّر حفظ الخدمة');
  }

  await notifyUser({
    recipientProfileId: await getInstructorUserId(instructorId),
    title: status === 'approved' ? 'تم اعتماد خدمتك' : 'تحديث على خدمتك',
    message:
      status === 'approved'
        ? `اعتمدت الإدارة حصيلتك في هذه الخدمة${approvedPrice != null ? ` بمبلغ ${approvedPrice} ج.م` : ''}.`
        : 'الخدمة ما زالت قيد المراجعة.',
    link: '/dashboard/instructor/services',
  });

  revalidatePath(`/dashboard/admin/instructors/${instructorId}`);
  revalidatePath('/creative-writing/services');
  revalidatePath('/dashboard/instructor/services');
  return { ok: true };
}

export async function removeInstructorServiceOffer(
  instructorId: string,
  serviceId: string
) {
  await requireInstructorAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('instructor_services')
    .delete()
    .eq('instructor_id', instructorId)
    .eq('service_id', serviceId);

  if (error) {
    console.error('Error removing instructor service offer', error);
    throw new Error('تعذّر حذف الخدمة');
  }

  revalidatePath(`/dashboard/admin/instructors/${instructorId}`);
  revalidatePath('/creative-writing/services');
  return { ok: true };
}

/** رفض طلب المدرب مع ملاحظة توضّح السبب. */
export async function rejectInstructorServiceOffer(
  instructorId: string,
  serviceId: string,
  adminNotes: string
) {
  await requireInstructorAdmin();
  if (!adminNotes.trim()) {
    throw new Error('اكتب سبب الرفض ليصل للمدرب');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('instructor_services')
    .update({
      status: 'rejected',
      approved_price: null,
      is_active: false,
      admin_notes: adminNotes.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('instructor_id', instructorId)
    .eq('service_id', serviceId);

  if (error) {
    console.error('Error rejecting instructor service offer', error);
    throw new Error('تعذّر رفض الطلب');
  }

  await notifyUser({
    recipientProfileId: await getInstructorUserId(instructorId),
    title: 'لم تُعتمد الخدمة',
    message: adminNotes.trim(),
    link: '/dashboard/instructor/services',
  });

  revalidatePath(`/dashboard/admin/instructors/${instructorId}`);
  revalidatePath('/dashboard/instructor/services');
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

/* ================================================================
 * الجانب الخاص بالمدرب
 * ================================================================
 * المدرب يطلب تقديم خدمة ويقترح حصيلته، ويوقف خدمته مؤقتًا.
 *
 * ما لا يستطيعه هنا: اعتماد نفسه، أو كتابة السعر المعتمد. هذا مفروض
 * بمُشغِّل في قاعدة البيانات، لا بهذا الملف — الكود هنا للرسالة الواضحة فقط.
 */

async function requireOwnInstructorId(): Promise<string> {
  const user = await getCurrentUser();
  if (user.role !== 'instructor') {
    throw new Error('هذه الصفحة للمدربين فقط');
  }
  const instructorId = await getMyInstructorId();
  if (!instructorId) {
    throw new Error('لم يتم ربط حسابك بملف مدرب بعد');
  }
  return instructorId;
}

function validatePrice(price: number) {
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('السعر لازم يكون رقم أكبر من صفر');
  }
  if (price > 1_000_000) {
    throw new Error('السعر غير منطقي');
  }
}

/**
 * «أقدّم هذه الخدمة» — طلب جديد، أو تعديل السعر المقترح على طلب قائم.
 *
 * المبلغ المقترح هو **حصيلة المدرب**، لا ما يدفعه العميل: سعر العميل يُحسب
 * بمعادلة المنصة فوقه، تمامًا كما في تسعير الجلسات.
 */
export async function proposeServiceOffer(serviceId: string, requestedPrice: number) {
  const instructorId = await requireOwnInstructorId();
  validatePrice(requestedPrice);

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('instructor_services')
    .select('id')
    .eq('instructor_id', instructorId)
    .eq('service_id', serviceId)
    .maybeSingle();

  // تعديل السعر المقترح لا يُنزل الحالة من "معتمدة" — الخدمة تظل معروضة
  // للعملاء بالسعر المعتمد القديم حتى تعتمد الإدارة السعر الجديد.
  const { error } = existing
    ? await supabase
        .from('instructor_services')
        .update({ requested_price: requestedPrice, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    : await supabase.from('instructor_services').insert({
        instructor_id: instructorId,
        service_id: serviceId,
        requested_price: requestedPrice,
        status: 'pending',
        is_active: true,
      });

  if (error) {
    console.error('Error proposing service offer', error);
    throw new Error('تعذّر إرسال الطلب');
  }

  revalidatePath('/dashboard/instructor/services');
  revalidatePath(`/dashboard/admin/instructors/${instructorId}`);
  revalidatePath('/dashboard/admin');
  return { ok: true };
}

/** إيقاف مؤقت أو إعادة تفعيل — بيد المدرب، وتخفي خدمته من قائمة العملاء. */
export async function setMyOfferActive(serviceId: string, isActive: boolean) {
  const instructorId = await requireOwnInstructorId();
  const supabase = await createClient();

  const { error } = await supabase
    .from('instructor_services')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('instructor_id', instructorId)
    .eq('service_id', serviceId);

  if (error) {
    console.error('Error toggling offer', error);
    throw new Error('تعذّر تغيير حالة الخدمة');
  }

  revalidatePath('/dashboard/instructor/services');
  revalidatePath('/creative-writing/services');
  return { ok: true };
}

/** سحب طلب لم تبتّ فيه الإدارة بعد. */
export async function withdrawMyOffer(serviceId: string) {
  const instructorId = await requireOwnInstructorId();
  const supabase = await createClient();

  const { data: offer } = await supabase
    .from('instructor_services')
    .select('id, status')
    .eq('instructor_id', instructorId)
    .eq('service_id', serviceId)
    .maybeSingle();

  if (!offer) throw new Error('الطلب غير موجود');
  if (offer.status === 'approved') {
    throw new Error('الخدمة معتمدة — استخدم «إيقاف مؤقت» بدل السحب');
  }

  const { error } = await supabase
    .from('instructor_services')
    .delete()
    .eq('id', offer.id);

  if (error) {
    console.error('Error withdrawing offer', error);
    throw new Error('تعذّر سحب الطلب');
  }

  revalidatePath('/dashboard/instructor/services');
  revalidatePath('/dashboard/admin');
  return { ok: true };
}
