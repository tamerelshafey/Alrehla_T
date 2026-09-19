'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth-guard';
import { logAuditAction } from '@/lib/audit';

/**
 * إدارة الإضافات.
 *
 * الأسعار هنا هي المصدر الوحيد: دالة إنشاء الطلب في القاعدة بتقرا منها،
 * والمتصفح ما بيبعتش أسعار خالص. يعني تعديل السعر من الشاشة دي بيأثر
 * على الطلبات الجديدة بس — الطلبات القديمة محتفظة بنسخة من السعر اللي
 * العميل دفعه وقتها.
 *
 * بترجّع النتيجة بدل ما ترمي الخطأ: Next بيخفي الرسائل المرمية في
 * الإنتاج ويستبدلها بنص إنجليزي عام.
 */
export type AddonResult = { ok: true } | { ok: false; error: string };

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || `addon-${Date.now()}`
  );
}

export async function saveAddon(params: {
  id?: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
  supportsCustomization: boolean;
  customizationPrice: number;
}): Promise<AddonResult> {
  const admin = await requireAdmin('canManageCatalog', 'غير مصرح لك بإدارة الإضافات');

  const name = params.name.trim();
  if (!name) return { ok: false, error: 'اكتب اسم الإضافة' };
  if (!Number.isFinite(params.price) || params.price < 0) {
    return { ok: false, error: 'السعر غير صحيح' };
  }
  // القاعدة عليها قيد `>= 0` — بنمسكها هنا برسالة عربية بدل ما القيد
  // يرجّع نص إنجليزي.
  if (!Number.isFinite(params.customizationPrice) || params.customizationPrice < 0) {
    return { ok: false, error: 'سعر التخصيص غير صحيح' };
  }

  const supabase = await createClient();
  const row = {
    name,
    description: params.description.trim() || null,
    price: params.price,
    is_active: params.isActive,
    sort_order: Number.isFinite(params.sortOrder) ? params.sortOrder : 0,
    supports_customization: params.supportsCustomization,
    // إضافة مش بتقبل تخصيص سعر تخصيصها صفر — عشان ميفضلش رقم قديم
    // مخبّى في الجدول لو الإدارة رجّعت تفعّل التخصيص بعدين.
    customization_price: params.supportsCustomization ? params.customizationPrice : 0,
    updated_at: new Date().toISOString(),
  };

  const { error } = params.id
    ? await supabase.from('addon_products').update(row).eq('id', params.id)
    : await supabase.from('addon_products').insert({ ...row, slug: slugify(name) });

  if (error) {
    console.error('Error saving addon', error);
    return { ok: false, error: `تعذّر الحفظ: ${error.message}` };
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: params.id ? 'addon_updated' : 'addon_created',
    entityType: 'AddonProduct',
    entityId: params.id ?? name,
    metadata: {
      price: params.price,
      supportsCustomization: params.supportsCustomization,
      customizationPrice: params.customizationPrice,
    },
  });

  revalidatePath('/dashboard/admin/addons');
  revalidatePath('/enha-lak/custom');
  return { ok: true };
}

/**
 * إيقاف الإضافة بدل حذفها.
 *
 * الحذف بيكسر الطلبات القديمة اللي اختارتها. الإيقاف بيشيلها من قدام
 * العميل ويسيب التاريخ زي ما هو.
 */
export async function setAddonActive(id: string, isActive: boolean): Promise<AddonResult> {
  const admin = await requireAdmin('canManageCatalog', 'غير مصرح لك بإدارة الإضافات');

  const supabase = await createClient();
  const { error } = await supabase
    .from('addon_products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error toggling addon', error);
    return { ok: false, error: `تعذّر التغيير: ${error.message}` };
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: isActive ? 'addon_activated' : 'addon_suspended',
    entityType: 'AddonProduct',
    entityId: id,
  });

  revalidatePath('/dashboard/admin/addons');
  revalidatePath('/enha-lak/custom');
  return { ok: true };
}
