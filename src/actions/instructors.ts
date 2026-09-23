'use server';
import { requireAdmin, requireAnyAdmin } from '@/lib/auth-guard';

import { Instructor } from '@/types';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import { notifyUser, getInstructorUserId, notifyAdmins } from '@/lib/notifications';

/**
 * Instructor profile changes, certification and pricing settings.
 *
 * Every action in this file used to mutate an in-memory array: the admin saw a
 * success message, and nothing was written anywhere. A restart erased it all.
 * These now write to the database, with the authorisation check done here for a
 * clear error and again by row-level security, which is the real guard.
 */

/** يفوّض للقاعدة الموحّدة في `@/lib/auth-guard` — التنفيذ واحد، والرسالة خاصة بهذا المجال. */
async function requireInstructorAdmin() {
  return requireAdmin('canManageInstructors', 'غير مصرح لك بإدارة المدربين');
}

/** The instructor must be asking about their own profile. */
async function requireOwnInstructorProfile(instructorId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('يجب تسجيل الدخول أولاً');

  const { data } = await supabase
    .from('instructors')
    .select('id')
    .eq('id', instructorId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) throw new Error('غير مصرح لك بتعديل هذا الملف');
  return user;
}

export async function submitInstructorProfileUpdate(
  instructorId: string,
  changes: Partial<Instructor>
) {
  await requireOwnInstructorProfile(instructorId);
  const supabase = await createClient();

  const { error } = await supabase.from('profile_update_requests').insert({
    instructor_id: instructorId,
    requested_changes: changes as never,
    status: 'pending',
  });

  if (error) {
    console.error('Error submitting profile update request', error);
    throw new Error('تعذّر إرسال الطلب');
  }

  // من غير الإشعار ده، طلب المراجعة بيستنى لحد ما حد يفتح شاشة المدرب
  // بالصدفة — وده اللي كان بيحصل.
  await notifyAdmins({
    event: 'instructor_profile',
    title: 'طلب تعديل ملف مدرب',
    message: 'مدرب طلب تعديل بياناته وبيستنى المراجعة.',
    link: `/dashboard/admin/instructors/${instructorId}`,
  });

  revalidatePath('/dashboard/instructor/settings');
  revalidatePath(`/dashboard/admin/instructors/${instructorId}`);
  return { success: true };
}

export async function approveProfileUpdateRequest(requestId: string) {
  const currentUser = await requireInstructorAdmin();
  const supabase = await createClient();

  const { data: request, error: readError } = await supabase
    .from('profile_update_requests')
    .select('id, instructor_id, requested_changes, status')
    .eq('id', requestId)
    .single();

  if (readError || !request) throw new Error('الطلب غير موجود');
  if (request.status !== 'pending') throw new Error('تم البتّ في هذا الطلب من قبل');

  const changes = (request.requested_changes ?? {}) as Partial<Instructor>;

  // Build the update from the requested changes only — never trust the payload
  // to carry fields the instructor is not allowed to change.
  const update: Database['public']['Tables']['instructors']['Update'] = {};

  // Profile details (bio, specialties, years of experience, display name).
  if (changes.displayName !== undefined) update.display_name = changes.displayName;
  if (changes.bio !== undefined) update.bio = changes.bio;
  if (changes.specialties !== undefined) update.specialties = changes.specialties;
  if (changes.yearsExperience !== undefined) {
    update.years_experience = changes.yearsExperience;
  }

  if (changes.workModel) update.work_model = changes.workModel;
  if (changes.monthlyHoursCommitted !== undefined) {
    update.monthly_hours_committed = changes.monthlyHoursCommitted;
  }
  if (changes.weeklySchedule) update.weekly_schedule = changes.weeklySchedule as never;

  if (changes.requestedPrice) {
    update.requested_price = changes.requestedPrice;
    update.approved_price = changes.requestedPrice;
  }

  // كان هنا فرع تالت بياخد الحصيلة من «فئة سعر» ثابتة
  // (`instructor_pricing_options`). الفئات اتشالت من شاشة المدرب —
  // بيكتب رقمه بنفسه دلوقتي — فالفرع بقى بلا مصدر.

  update.updated_at = new Date().toISOString();
  const { data: updatedInstructor, error: updateError } = await supabase
    .from('instructors')
    .update(update)
    .eq('id', request.instructor_id)
    .select('id')
    .maybeSingle();

  if (updateError) {
    console.error('Error applying approved changes', updateError);
    throw new Error('تعذّر تطبيق التعديلات');
  }

  // صفر صفوف = المدرب مش موجود أو الصلاحيات رفضت بصمت. من غير الفحص
  // ده الطلب كان بيتقفل «تمت الموافقة» والمدرب ما اتغيّرش فيه حاجة.
  if (!updatedInstructor) {
    throw new Error('التعديلات مروّحتش للقاعدة — ملف المدرب مش موجود أو الصلاحيات مش سامحة.');
  }

  const { data: statusRows, error: statusError } = await supabase
    .from('profile_update_requests')
    .update({ status: 'approved' })
    .eq('id', requestId)
    .select('id')
    .maybeSingle();
  if (statusError) throw new Error('تعذّر تحديث حالة الطلب');
  if (!statusRows) {
    throw new Error('الطلب مش موجود أو اتقفل قبل كده.');
  }

  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: 'instructor_profile_update_approved',
    entityType: 'ProfileUpdateRequest',
    entityId: requestId,
    metadata: { instructorId: request.instructor_id },
  });

  await notifyUser({
    event: 'instructor_profile',
    recipientProfileId: await getInstructorUserId(request.instructor_id),
    title: 'تم اعتماد تعديلات ملفك',
    message: 'التعديلات التي أرسلتها ظاهرة الآن للطلاب.',
    link: '/dashboard/instructor/profile',
  });

  revalidatePath(`/dashboard/admin/instructors/${request.instructor_id}`);
  revalidatePath('/dashboard/instructor/settings');
  return { success: true };
}

export const approveProfileUpdate = approveProfileUpdateRequest;

export async function rejectProfileUpdateRequest(requestId: string, adminFeedback: string) {
  const currentUser = await requireInstructorAdmin();
  const supabase = await createClient();

  const { data: request, error: readError } = await supabase
    .from('profile_update_requests')
    .select('id, instructor_id')
    .eq('id', requestId)
    .single();

  if (readError || !request) throw new Error('الطلب غير موجود');

  const { data: rejectedRows, error } = await supabase
    .from('profile_update_requests')
    .update({ status: 'rejected', admin_feedback: adminFeedback })
    .eq('id', requestId)
    .select('id');

  if (error) throw new Error('تعذّر تحديث حالة الطلب');
  if (!rejectedRows || rejectedRows.length === 0) {
    throw new Error('الطلب مش موجود أو اتقفل قبل كده.');
  }

  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: 'instructor_profile_update_rejected',
    entityType: 'ProfileUpdateRequest',
    entityId: requestId,
    metadata: { instructorId: request.instructor_id, adminFeedback },
  });

  await notifyUser({
    event: 'instructor_profile',
    recipientProfileId: await getInstructorUserId(request.instructor_id),
    title: 'لم تُعتمد تعديلات ملفك',
    message: adminFeedback,
    link: '/dashboard/instructor/profile',
  });

  revalidatePath(`/dashboard/admin/instructors/${request.instructor_id}`);
  revalidatePath('/dashboard/instructor/settings');
  return { success: true };
}

export async function updateInstructorCertification(instructorId: string, passed: boolean) {
  const currentUser = await requireInstructorAdmin();
  const supabase = await createClient();

  const { data: saved, error } = await supabase
    .from('instructor_certifications')
    .upsert(
      {
        instructor_id: instructorId,
        exam_passed: passed,
        certified_at: passed ? new Date().toISOString() : null,
      },
      { onConflict: 'instructor_id' }
    )
    .select('id')
    .single();

  if (error) {
    console.error('Error saving certification', error);
    throw new Error('تعذّر حفظ حالة الاعتماد');
  }

  // The instructor record carries the same flag, so keep the two in step.
  //
  // ده كان `await` من غير أي فحص — لا خطأ ولا عدد صفوف. يعني شهادة
  // بتتسجّل على المدرب وعمود `training_passed` عليه يفضل زي ما هو،
  // والشاشتين يقولوا حاجتين مختلفتين.
  const { data: flagRows, error: flagError } = await supabase
    .from('instructors')
    .update({ training_passed: passed, updated_at: new Date().toISOString() })
    .eq('id', instructorId)
    .select('id');

  if (flagError || !flagRows || flagRows.length === 0) {
    console.error('Error syncing instructor training flag', flagError);
    throw new Error('الشهادة اتسجّلت بس حالة التدريب على ملف المدرب مااتحدّثتش.');
  }

  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: passed ? 'instructor_certification_passed' : 'instructor_certification_failed',
    entityType: 'InstructorCertification',
    entityId: saved?.id ?? instructorId,
    metadata: { instructorId },
  });

  revalidatePath(`/dashboard/admin/instructors/${instructorId}`);
  return { success: true };
}

export async function updatePricingFormulaSettings(
  platformMultiplier: number,
  fixedAdminFee: number
) {
  const user = await requireAnyAdmin(
    ['canManageCatalog', 'canManageInstructors'],
    'غير مصرح لك بتعديل إعدادات التسعير',
  );

  const supabase = await createClient();
  // `upsert` مش `update`: صف `default` ممكن ما يكونش موجود أصلًا في
  // قاعدة جديدة، و`UPDATE` على صف مش موجود بينجح ويغيّر **صفر** صفوف —
  // فالشاشة تقول «اتحفظ» والمعادلة تفضل على القيم الافتراضية، وكل سعر
  // خدمة بيتحسب غلط بعد كده.
  const { data: formulaRows, error } = await supabase
    .from('pricing_formula_settings')
    .upsert(
      {
        id: 'default',
        platform_multiplier: platformMultiplier,
        fixed_admin_fee: fixedAdminFee,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select('id');

  if (error) {
    console.error('Error updating pricing formula', error);
    throw new Error('تعذّر حفظ إعدادات التسعير');
  }
  if (!formulaRows || formulaRows.length === 0) {
    throw new Error('إعدادات التسعير مروّحتش للقاعدة — الصلاحيات مش سامحة بالتعديل.');
  }

  await logAuditAction({
    actorProfileId: user.id,
    actorName: user.fullName,
    action: 'pricing_formula_updated',
    entityType: 'PricingFormulaSettings',
    entityId: 'default',
    metadata: { platformMultiplier, fixedAdminFee },
  });

  revalidatePath('/dashboard/admin/settings/creative-writing-pricing');
  return { success: true };
}

/**
 * An admin editing an instructor's public profile directly.
 *
 * The instructor's own edits go through `profile_update_requests` for review;
 * an admin with canManageInstructors edits in place, so existing instructor
 * cards can be filled in without waiting for each instructor to log in.
 */
export async function updateInstructorProfileByAdmin(
  instructorId: string,
  details: {
    displayName: string;
    bio: string;
    specialties: string[];
    yearsExperience: number;
  }
) {
  const currentUser = await requireInstructorAdmin();
  const supabase = await createClient();

  const displayName = details.displayName.trim();
  if (!displayName) throw new Error('اسم المدرب مطلوب');
  if (!Number.isFinite(details.yearsExperience) || details.yearsExperience < 0) {
    throw new Error('سنوات الخبرة غير صحيحة');
  }

  const { data: savedRows, error } = await supabase
    .from('instructors')
    .update({
      display_name: displayName,
      bio: details.bio.trim(),
      specialties: details.specialties,
      years_experience: details.yearsExperience,
      updated_at: new Date().toISOString(),
    })
    .eq('id', instructorId)
    .select('id');

  if (error) {
    console.error('Error updating instructor profile', error);
    throw new Error('تعذّر حفظ بيانات المدرب');
  }
  if (!savedRows || savedRows.length === 0) {
    throw new Error('الحفظ مروّحش للقاعدة — المدرب مش موجود أو الصلاحيات مش سامحة.');
  }

  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: 'instructor_profile_edited_by_admin',
    entityType: 'Instructor',
    entityId: instructorId,
    metadata: { displayName, yearsExperience: details.yearsExperience },
  });

  revalidatePath(`/dashboard/admin/instructors/${instructorId}`);
  revalidatePath('/dashboard/admin/instructors');
  revalidatePath('/creative-writing/instructors');
  revalidatePath(`/creative-writing/instructors/${instructorId}`);
  return { success: true };
}
