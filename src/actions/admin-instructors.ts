'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/data/domains/auth';
import { hasAdminPermission } from '@/lib/utils';
import { logAuditAction } from '@/lib/audit';

/**
 * إضافة مدرب من لوحة الإدارة.
 *
 * مدرب = حساب دخول + صف في جدول المدربين. العمودان مربوطان: جدول المدربين
 * بيشترط `user_id`، فمفيش مدرب من غير حساب.
 *
 * الدالة بتغطي الحالتين:
 *   - الشخص مسجَّل بالفعل → بنحوّل دوره لمدرب وبننشئ صف المدرب
 *   - الشخص جديد → بنولّد رابط دعوة ترجعه الشاشة للإدارة عشان تبعته
 *     للمدرب بنفسها، ويحدد كلمة مروره منه
 *
 * المدرب الجديد بيبدأ بحالة «قيد التدريب» وتدريب غير مجتاز — مش «نشط».
 * إنه يظهر للعملاء قرار منفصل بياخده المسؤول بعد ما يخلّص تدريبه.
 */
export async function createInstructor(params: {
  email: string;
  fullName: string;
  displayName: string;
  bio: string;
  specialties: string[];
  yearsExperience: number;
  workModel: 'monthly' | 'per_session';
}) {
  const admin = await getCurrentUser();
  if (!hasAdminPermission(admin, 'canManageInstructors')) {
    throw new Error('غير مصرح لك بإضافة مدربين');
  }

  const email = params.email.trim().toLowerCase();
  const fullName = params.fullName.trim();
  const displayName = params.displayName.trim() || fullName;

  if (!email || !email.includes('@')) throw new Error('اكتب بريدًا إلكترونيًا صحيحًا');
  if (!fullName) throw new Error('اكتب اسم المدرب');

  const supabaseAdmin = createAdminClient();

  // هل الشخص مسجَّل بالفعل؟ لو أيوه، دعوة تانية هتفشل بلا داعٍ.
  const { data: existingList } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const existing = existingList?.users.find(
    (u) => u.email?.toLowerCase() === email,
  );

  let userId: string;
  let invited = false;
  let inviteLink: string | null = null;

  if (existing) {
    userId = existing.id;

    // له صف مدرب بالفعل؟
    const { data: already } = await supabaseAdmin
      .from('instructors')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (already) {
      throw new Error('الشخص ده مسجَّل كمدرب بالفعل');
    }
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      console.error('Error generating instructor invite link', error);
      throw new Error('تعذّر إنشاء الدعوة');
    }
    if (!data.user?.id || !data.properties?.action_link) {
      throw new Error('تعذّر إنشاء الحساب');
    }
    userId = data.user.id;
    inviteLink = data.properties.action_link;
    invited = true;
  }

  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .upsert({ id: userId, full_name: fullName, role: 'instructor' }, { onConflict: 'id' });

  if (profileError) {
    console.error('Error setting instructor profile', profileError);
    throw new Error('تعذّر حفظ بيانات المستخدم');
  }

  const { data: created, error: instructorError } = await supabaseAdmin
    .from('instructors')
    .insert({
      user_id: userId,
      display_name: displayName,
      bio: params.bio.trim(),
      specialties: params.specialties,
      years_experience: Number(params.yearsExperience) || 0,
      status: 'pending_training',
      training_passed: false,
      work_model: params.workModel,
    })
    .select('id')
    .single();

  if (instructorError || !created) {
    console.error('Error creating instructor', instructorError);
    throw new Error('تعذّر إنشاء ملف المدرب');
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: 'instructor_created',
    entityType: 'Instructor',
    entityId: created.id,
    metadata: { email, invited },
  });

  revalidatePath('/dashboard/admin/instructors');
  revalidatePath('/creative-writing/instructors');

  return { ok: true, instructorId: created.id, invited, inviteLink };
}
