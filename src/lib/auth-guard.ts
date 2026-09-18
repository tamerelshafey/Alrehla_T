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

/**
 * الحساب ده حساب طفل تابع؟
 *
 * حساب الطفل بيتعمل من المركز العائلي، ومربوط بصف العائلة في
 * `child_profiles.account_profile_id`.
 */
export async function getDependentGuardian(
  profileId: string,
): Promise<{ childId: string; guardianId: string; fullName: string } | null> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('child_profiles')
    .select('id, user_profile_id, full_name')
    .eq('account_profile_id', profileId)
    .maybeSingle();

  if (!data) return null;
  return { childId: data.id, guardianId: data.user_profile_id, fullName: data.full_name };
}

/**
 * الإجراء ده ممنوع على حساب الطفل التابع.
 *
 * ── ليه الحارس ده موجود ─────────────────────────────────────
 *
 * فتحنا حسابات دخول للأطفال وافترضنا إن الدور `student` بيمنعهم من
 * الشراء. **الافتراض ده كان غلط**: جرد كل دوال الخادم طلّع إن **ولا
 * دالة واحدة** بتفرّق بين `student` و`customer`. فحساب الطفل كان يقدر
 * يطلب خدمة ويحجز باقة ويشتري منتجات ويرفع إيصالات — وحتى يطلب حذف
 * حسابه.
 *
 * والحماية مش إخفاء الأزرار: الطفل (أو أي حد) يقدر يستدعي دالة الخادم
 * مباشرةً. المنع لازم يبقى هنا.
 *
 * ⚠️ ده منع مؤقت للطريق المباشر. المسار المقصود إن طلب الطفل يروح
 *    لولي الأمر في المركز العائلي، يوافق أو يعدّل، وبعدين يروح للدفع.
 *    لحد ما المسار ده يتبني، الرسالة بتوجّه الطفل لولي أمره.
 */
export async function requireNotDependent(
  action = 'العملية دي',
): Promise<UserProfile> {
  const user = await requireUser();
  const dependent = await getDependentGuardian(user.id);
  if (dependent) {
    throw new Error(`${action} محتاجة موافقة ولي أمرك. كلّمه يعملها من حسابه.`);
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

/**
 * الإدارة ومعاها **أي واحدة** من الصلاحيات دي.
 *
 * بعض الشاشات بيوصل لها أكتر من دور — إعدادات التسعير مثلًا بيعدّلها
 * مسؤول الكتالوج ومسؤول المدربين.
 */
export async function requireAnyAdmin(
  permissions: AdminPermission[],
  message = 'غير مصرح لك بهذا الإجراء',
): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!permissions.some((p) => hasAdminPermission(user, p))) {
    throw new Error(message);
  }
  return user;
}
