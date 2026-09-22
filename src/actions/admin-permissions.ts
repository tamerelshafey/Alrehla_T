'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, ALL_ADMIN_PERMISSIONS } from '@/data/domains/auth';
import { logAuditAction } from '@/lib/audit';
import { AdminPermission } from '@/types';

/**
 * صلاحيات الإداريين.
 *
 * قبل كده كانت الصلاحيات **مكتوبة في الكود** حسب الدور: مدير النظام
 * بياخد الكل والمشرف العام بياخد تسعة. مكانش فيه أي طريقة تخصّص حساب
 * بعينه غير بتعديل الكود.
 *
 * دلوقتي عمود `permissions` في القاعدة:
 *   • فاضي  = الافتراضي بتاع دوره (وضع كل الحسابات الحالية).
 *   • متملّي = دي صلاحياته بالظبط.
 *
 * مدير النظام بس هو اللي بيعدّل الصلاحيات. المشرف العام ممنوع عن قصد:
 * صلاحية تعديل الصلاحيات هي مفتاح المنصة كلها.
 */
export type PermissionsResult = { ok: true } | { ok: false; error: string };

export async function updateAdminPermissions(params: {
  userId: string;
  permissions: AdminPermission[];
  useRoleDefault: boolean;
}): Promise<PermissionsResult> {
  const actor = await getCurrentUser();

  if (actor.role !== 'super_admin') {
    return { ok: false, error: 'تعديل الصلاحيات لمدير النظام فقط' };
  }

  // القفل ده مقصود: لو مدير النظام شال صلاحية من نفسه بالغلط، مفيش حد
  // تاني يقدر يرجّعها له غير من قاعدة البيانات مباشرة.
  if (params.userId === actor.id) {
    return { ok: false, error: 'ما ينفعش تعدّل صلاحيات حسابك أنت' };
  }

  const clean = params.useRoleDefault
    ? null
    : params.permissions.filter((p) => ALL_ADMIN_PERMISSIONS.includes(p));

  if (clean !== null && clean.length === 0) {
    return {
      ok: false,
      error: 'اختار صلاحية واحدة على الأقل، أو رجّعه للافتراضي بتاع دوره',
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ permissions: clean, updated_at: new Date().toISOString() })
    .eq('id', params.userId)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Error updating permissions', error);
    return { ok: false, error: `تعذّر الحفظ: ${error.message}` };
  }

  if (!data) {
    return { ok: false, error: 'المستخدم غير موجود أو تعذّر تحديث صلاحياته' };
  }

  await logAuditAction({
    actorProfileId: actor.id,
    actorName: actor.fullName,
    action: 'admin_permissions_changed',
    entityType: 'UserProfile',
    entityId: params.userId,
    metadata: { permissions: clean ?? 'role-default' },
  });

  revalidatePath('/dashboard/admin/users/permissions');
  return { ok: true };
}
