'use server';
import { requireAdmin } from '@/lib/auth-guard';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditAction } from '@/lib/audit';
import { generateTempCode, MUST_SET_PASSWORD } from '@/lib/first-login';

/**
 * إضافة مدرب من لوحة الإدارة.
 *
 * مدرب = حساب دخول + صف في جدول المدربين. العمودان مربوطان: جدول المدربين
 * بيشترط `user_id`، فمفيش مدرب من غير حساب.
 *
 * الدالة بتغطي الحالتين:
 *   - الشخص مسجَّل بالفعل → بنحوّل دوره لمدرب وبننشئ صف المدرب،
 *     **وكلمة مروره ما بتتلمسش** — هو داخل بيها خلاص
 *   - الشخص جديد → بنعمل الحساب **برمز مؤقت** ترجعه الشاشة للإدارة
 *     عشان تبعته للمدرب. وأول ما يدخل بيه، الموقع بيوقفه على شاشة
 *     «حط كلمة مرورك» قبل أي حاجة تانية (`src/lib/first-login.ts`)
 *
 * ⚠️ **كان رابط دعوة، واتغيّر بقرار.** الرابط مفتاح حساب كامل، طويل
 *    وصعب النقل على واتساب، وبينتهي بمدة — فالمدرب اللي يفتحه متأخر
 *    كان محتاج دعوة جديدة. والرمز المؤقت بيدّي نفس النتيجة: المدرب
 *    هو اللي بيحدّد كلمة مروره في الآخر، ومفيش كلمة مرور دائمة
 *    بتعرفها الإدارة.
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
  const admin = await requireAdmin('canManageInstructors', 'غير مصرح لك بإضافة مدربين');

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
  let tempCode: string | null = null;

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
    const code = generateTempCode();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: code,
      // مفعّل فورًا: مفيش بريد تأكيد بيتبعت، والإدارة هي اللي بتسلّم
      // الرمز بإيدها. ومن غير ده الحساب يتعمل ويقف برّه.
      email_confirm: true,
      user_metadata: { full_name: fullName },
      // ⚠️ **العلامة في `app_metadata` لا `user_metadata`**: التانية
      //    المستخدم يعدّلها من المتصفح بنداء واحد، فكان هيشيلها
      //    ويعدّي الشاشة وهو لسه على الرمز المؤقت.
      app_metadata: { [MUST_SET_PASSWORD]: true },
    });
    if (error) {
      console.error('Error creating instructor account', error);
      if (error.message?.toLowerCase().includes('already')) {
        throw new Error('فيه حساب بالبريد ده بالفعل');
      }
      throw new Error('تعذّر إنشاء الحساب');
    }
    if (!data.user?.id) {
      throw new Error('تعذّر إنشاء الحساب');
    }
    userId = data.user.id;
    tempCode = code;
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

  return { ok: true, instructorId: created.id, invited, tempCode };
}
