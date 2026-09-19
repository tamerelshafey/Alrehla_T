'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/data/domains/auth';
import { logAuditAction } from '@/lib/audit';

/**
 * A person editing their own profile.
 *
 * All three profile screens (instructor, publisher, student) used one shared
 * form whose save button was wired to nothing at all: the fields could be
 * typed into, the button clicked, and nothing was ever written.
 */

/** The signed-in user's own name and picture, stored in `user_profiles`. */
export async function updateMyProfile(params: { fullName: string; avatarUrl?: string }) {
  const fullName = params.fullName.trim();
  if (!fullName) throw new Error('اكتب اسمك');
  if (fullName.length > 120) throw new Error('الاسم طويل جدًا');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('يجب تسجيل الدخول أولاً');

  const { data: saved, error } = await supabase
    .from('user_profiles')
    .update({
      full_name: fullName,
      avatar_url: params.avatarUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select('id');

  if (error) {
    console.error('Error updating profile', error);
    throw new Error('تعذّر حفظ البيانات');
  }

  // ⚠️ قاعدة (و): `UPDATE` على صف مش موجود — أو صف بترفضه الصلاحيات —
  // بينجح بصفر صفوف وبلا أي خطأ. من غير الفحص ده الشاشة بتقول «اتحفظ»
  // ومفيش حاجة وصلت للقاعدة، والمستخدم بيدوّر على صورته وما بيلاقيهاش.
  if (!saved || saved.length === 0) {
    throw new Error('لم يصل الحفظ إلى قاعدة البيانات. جرّب تاني.');
  }

  revalidatePath('/dashboard/student/profile');
  revalidatePath('/dashboard/instructor/profile');
  revalidatePath('/account');
  revalidatePath('/', 'layout');

  // صفحات المدربين العامة مخزَّنة مؤقتًا (تتجدد كل ساعة). الصورة بقت
  // بتظهر فيها، فلازم تتجدد دلوقتي — وإلا المدرب يغيّر صورته ويشوفها في
  // لوحته بس، ويفضل الموقع العام على القديمة لحد ساعة.
  revalidatePath('/creative-writing/instructors');
  revalidatePath('/creative-writing/instructors/[id]', 'page');

  return { ok: true };
}

/**
 * A publisher editing their own house's details.
 *
 * Saved directly rather than sent for review: this is a contracted publisher's
 * own name, description and logo, not public editorial content — unlike an
 * instructor's bio, which is a claim shown to parents choosing a teacher.
 */
export async function updateMyPublisherProfile(params: {
  publisherId: string;
  name: string;
  bio: string;
  logoUrl?: string;
}) {
  const user = await getCurrentUser();
  const name = params.name.trim();
  if (!name) throw new Error('اكتب اسم دار النشر');

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error('يجب تسجيل الدخول أولاً');

  // The publisher must be the caller's own. The page used to show
  // `publishers[0]` — the first publisher in the whole table — so a second
  // publisher would have been editing somebody else's record.
  const { data: owned } = await supabase
    .from('publishers')
    .select('id')
    .eq('id', params.publisherId)
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (!owned) throw new Error('غير مصرح لك بتعديل هذا الملف');

  const { error } = await supabase
    .from('publishers')
    .update({
      name,
      bio: params.bio.trim(),
      logo_url: params.logoUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.publisherId);

  if (error) {
    console.error('Error updating publisher profile', error);
    throw new Error('تعذّر حفظ بيانات دار النشر');
  }

  await logAuditAction({
    actorProfileId: user.id,
    actorName: user.fullName,
    action: 'publisher_profile_updated',
    entityType: 'Publisher',
    entityId: params.publisherId,
    metadata: { name },
  });

  revalidatePath('/dashboard/publisher/profile');
  revalidatePath('/dashboard/publisher');
  revalidatePath('/enha-lak');
  return { ok: true };
}
