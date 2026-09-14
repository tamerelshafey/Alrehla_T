'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/data/domains/auth';
import { hasAdminPermission } from '@/lib/utils';
import { logAuditAction } from '@/lib/audit';
import type { UserRole } from '@/types';

const ASSIGNABLE_ROLES: UserRole[] = [
  'student',
  'instructor',
  'publisher',
  'general_supervisor',
  'super_admin',
];

/**
 * دعوة شخص للانضمام للمنصة.
 *
 * بنولّد **رابط دعوة** ونرجّعه للإدارة عشان تبعته بنفسها (واتساب مثلًا)،
 * بدل ما نعتمد على خدمة بريد. الرابط بيوصّل الشخص لصفحة يحط فيها كلمة
 * مروره بنفسه — فمفيش كلمة مرور بتمر على الإدارة ولا بتتخزّن في أي مكان،
 * وهي الخاصية الأمنية اللي كنا عايزينها من الدعوة بالبريد أصلًا.
 *
 * ⚠️ الرابط ده مفتاح: أي حد يفتحه يقدر يحدد كلمة المرور. يتبعت للشخص
 * المقصود وحده.
 */
export async function inviteUser(params: {
  email: string;
  fullName: string;
  role: UserRole;
}) {
  const admin = await getCurrentUser();
  if (!hasAdminPermission(admin, 'canManageUsers')) {
    throw new Error('غير مصرح لك بإضافة مستخدمين');
  }

  const email = params.email.trim().toLowerCase();
  const fullName = params.fullName.trim();

  if (!email || !email.includes('@')) throw new Error('اكتب بريدًا إلكترونيًا صحيحًا');
  if (!fullName) throw new Error('اكتب اسم الشخص');
  if (!ASSIGNABLE_ROLES.includes(params.role)) throw new Error('الدور المختار غير صالح');

  // منح صلاحيات إدارية قرار خطير: مدير النظام وحده يقدر يعمله.
  if (
    (params.role === 'super_admin' || params.role === 'general_supervisor') &&
    admin.role !== 'super_admin'
  ) {
    throw new Error('منح صلاحيات إدارية متاح لمدير النظام فقط');
  }

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    console.error('Error generating invite link', error);
    if (error.message?.toLowerCase().includes('already')) {
      throw new Error('فيه حساب بالبريد ده بالفعل');
    }
    throw new Error('تعذّر إنشاء الدعوة');
  }

  const newUserId = data.user?.id;
  const actionLink = data.properties?.action_link;
  if (!newUserId || !actionLink) throw new Error('تعذّر إنشاء الحساب');

  // الملف الشخصي قد يكون أُنشئ بمحفّز عند التسجيل — upsert بتتعامل مع
  // الحالتين من غير ما تكسر لو الصف موجود.
  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .upsert({ id: newUserId, full_name: fullName, role: params.role }, { onConflict: 'id' });

  if (profileError) {
    console.error('Error creating profile for invited user', profileError);
    throw new Error('اتبعتت الدعوة لكن تعذّر حفظ بيانات المستخدم — راجع الحساب يدويًا');
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: 'user_invited',
    entityType: 'UserProfile',
    entityId: newUserId,
    metadata: { email, role: params.role },
  });

  revalidatePath('/dashboard/admin/users');
  return { ok: true, userId: newUserId, inviteLink: actionLink };
}

/**
 * تغيير دور مستخدم.
 *
 * عملية جدول عادية — بتمر بصلاحيات قاعدة البيانات، مش بمفتاح الإدارة.
 */
export async function updateUserRole(userId: string, role: UserRole) {
  const admin = await getCurrentUser();
  if (!hasAdminPermission(admin, 'canManageUsers')) {
    throw new Error('غير مصرح لك بتعديل أدوار المستخدمين');
  }

  if (!ASSIGNABLE_ROLES.includes(role)) throw new Error('الدور المختار غير صالح');

  if (
    (role === 'super_admin' || role === 'general_supervisor') &&
    admin.role !== 'super_admin'
  ) {
    throw new Error('منح صلاحيات إدارية متاح لمدير النظام فقط');
  }

  // حماية من قفل النظام على نفسه: آخر مدير نظام ما يقدرش ينزّل دور نفسه.
  if (userId === admin.id && role !== admin.role && admin.role === 'super_admin') {
    const supabase = await createClient();
    const { count } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'super_admin');
    if ((count ?? 0) <= 1) {
      throw new Error('ما ينفعش تنزّل دورك وإنت آخر مدير نظام — عيّن غيرك الأول');
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('user_profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role', error);
    throw new Error('تعذّر تغيير الدور');
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: 'user_role_changed',
    entityType: 'UserProfile',
    entityId: userId,
    metadata: { role },
  });

  revalidatePath('/dashboard/admin/users');
  revalidatePath(`/dashboard/admin/users/${userId}`);
  return { ok: true };
}
