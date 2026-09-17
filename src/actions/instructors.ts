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

  if (changes.selectedPricingOptionId) {
    update.selected_pricing_option_id = changes.selectedPricingOptionId;
    const { data: option } = await supabase
      .from('instructor_pricing_options')
      .select('base_price_per_session')
      .eq('id', changes.selectedPricingOptionId)
      .maybeSingle();
    if (option) update.approved_price = option.base_price_per_session;
  }

  if (Object.keys(update).length > 0) {
    update.updated_at = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('instructors')
      .update(update)
      .eq('id', request.instructor_id);
    if (updateError) {
      console.error('Error applying approved changes', updateError);
      throw new Error('تعذّر تطبيق التعديلات');
    }
  }

  const { error: statusError } = await supabase
    .from('profile_update_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);
  if (statusError) throw new Error('تعذّر تحديث حالة الطلب');

  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: 'instructor_profile_update_approved',
    entityType: 'ProfileUpdateRequest',
    entityId: requestId,
    metadata: { instructorId: request.instructor_id },
  });

  await notifyUser({
    recipientProfileId: await getInstructorUserId(request.instructor_id),
    title: 'تم اعتماد تعديلات ملفك',
    message: 'التعديلات التي أرسلتها ظاهرة الآن للطلاب.',
    link: '/dashboard/instructor/profile',
  });

  revalidatePath(`/dashboard/admin/instructors/${request.instructor_id}`);
  revalidatePath('/dashboard/instructor/settings');
  return { success: true };
}

export async function rejectProfileUpdateRequest(requestId: string, adminFeedback: string) {
  const currentUser = await requireInstructorAdmin();
  const supabase = await createClient();

  const { data: request, error: readError } = await supabase
    .from('profile_update_requests')
    .select('id, instructor_id')
    .eq('id', requestId)
    .single();

  if (readError || !request) throw new Error('الطلب غير موجود');

  const { error } = await supabase
    .from('profile_update_requests')
    .update({ status: 'rejected', admin_feedback: adminFeedback })
    .eq('id', requestId);

  if (error) throw new Error('تعذّر تحديث حالة الطلب');

  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: 'instructor_profile_update_rejected',
    entityType: 'ProfileUpdateRequest',
    entityId: requestId,
    metadata: { instructorId: request.instructor_id, adminFeedback },
  });

  await notifyUser({
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
  await supabase
    .from('instructors')
    .update({ training_passed: passed, updated_at: new Date().toISOString() })
    .eq('id', instructorId);

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
  const { error } = await supabase
    .from('pricing_formula_settings')
    .update({
      platform_multiplier: platformMultiplier,
      fixed_admin_fee: fixedAdminFee,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'default');

  if (error) {
    console.error('Error updating pricing formula', error);
    throw new Error('تعذّر حفظ إعدادات التسعير');
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

  const { error } = await supabase
    .from('instructors')
    .update({
      display_name: displayName,
      bio: details.bio.trim(),
      specialties: details.specialties,
      years_experience: details.yearsExperience,
      updated_at: new Date().toISOString(),
    })
    .eq('id', instructorId);

  if (error) {
    console.error('Error updating instructor profile', error);
    throw new Error('تعذّر حفظ بيانات المدرب');
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
