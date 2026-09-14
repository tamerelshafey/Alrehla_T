import 'server-only';
import { getCurrentUser } from '@/data/domains/auth';
import { hasAdminPermission } from '@/lib/utils';
import type { AdminPermission, UserProfile } from '@/types';

/**
 * القاعدة الموحّدة للتحقق قبل أي عملية حسّاسة.
 *
 * ليه موجودة؟
 * فحص كل دوال الخادم طلّع 64 دالة بتكتب في قاعدة البيانات، 34 منها بلا
 * أي تحقق. أغلبهم كانوا محميين فعلًا بصلاحيات قاعدة البيانات — الكتابة
 * بتترفض هناك — لكن المستخدم كان بيشوف رسالة خطأ عامة مش مفهومة، وكان
 * كل واحد اللي بيكتب دالة جديدة بيختار بنفسه هل يتحقق ولا لأ.
 *
 * ⚠️ مبدأ لازم يفضل واضح:
 * الدوال دي **مش** هي الحارس. الحارس الحقيقي هو صلاحيات قاعدة البيانات
 * والمحفّزات، لأنها بتشتغل حتى لو حد تجاهل الموقع وكلّم قاعدة البيانات
 * مباشرة. الدوال دي بتضيف حاجتين:
 *   1. رسالة خطأ صحيحة ومفهومة بدل فشل غامض
 *   2. طبقة تانية — لو قاعدة ضلّت الطريق يومًا، الكود بيمسك
 *
 * عشان كده ما ينفعش أبدًا نستبدل قاعدة صلاحيات بواحدة من دول.
 */

/** المستخدم مسجَّل دخول؟ */
export async function requireUser(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user || user.role === 'visitor') {
    throw new Error('يجب تسجيل الدخول أولاً');
  }
  return user;
}

/** المستخدم إدارة، وعنده الصلاحية المطلوبة؟ */
export async function requireAdmin(
  permission: AdminPermission,
  message = 'غير مصرح لك بهذا الإجراء',
): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, permission)) {
    throw new Error(message);
  }
  return user;
}

/** مدير النظام وحده — للعمليات المالية وتعيين الصلاحيات. */
export async function requireSuperAdmin(
  message = 'هذا الإجراء متاح لمدير النظام فقط',
): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (user.role !== 'super_admin') {
    throw new Error(message);
  }
  return user;
}

/** المستخدم مدرب، ومعاه ملف مدرب؟ يرجّع معرّف المدرب. */
export async function requireInstructor(): Promise<{
  user: UserProfile;
  instructorId: string;
}> {
  const user = await requireUser();
  if (user.role !== 'instructor') {
    throw new Error('هذا الإجراء متاح للمدربين فقط');
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('instructors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) throw new Error('لا يوجد ملف مدرب مرتبط بحسابك');
  return { user, instructorId: data.id };
}
