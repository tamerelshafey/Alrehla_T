'use server';
import { requireAdmin } from '@/lib/auth-guard';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';

/**
 * Shipping fees by area, managed from the admin dashboard.
 *
 * Checkout used to charge a flat 50 EGP written into the code. The fee now
 * comes from this table, which means it has to be editable somewhere other
 * than the database console.
 */

/** يفوّض للقاعدة الموحّدة في `@/lib/auth-guard` — التنفيذ واحد، والرسالة خاصة بهذا المجال. */
async function requireOrdersAdmin() {
  return requireAdmin('canManageOrders', 'غير مصرح لك بإدارة أسعار الشحن');
}

function validate(governorate: string, city: string, fee: number) {
  const gov = governorate.trim();
  const area = city.trim();
  if (!gov) throw new Error('اكتب اسم المحافظة');
  if (!area) throw new Error('اكتب اسم المنطقة');
  if (!Number.isFinite(fee) || fee < 0) throw new Error('السعر غير صحيح');
  if (fee > 100000) throw new Error('السعر غير منطقي');
  return { gov, area };
}

export async function upsertShippingRate(params: {
  id?: string;
  governorate: string;
  city: string;
  fee: number;
  isActive: boolean;
}) {
  const admin = await requireOrdersAdmin();
  const { gov, area } = validate(params.governorate, params.city, params.fee);
  const supabase = await createClient();

  const row = {
    governorate: gov,
    city: area,
    fee: params.fee,
    is_active: params.isActive,
    updated_at: new Date().toISOString(),
  };

  const { data: saved, error } = params.id
    ? await supabase.from('shipping_rates').update(row).eq('id', params.id).select('id')
    : await supabase
        .from('shipping_rates')
        .upsert(row, { onConflict: 'governorate,city' })
        .select('id');

  if (error) {
    console.error('Error saving shipping rate', error);
    throw new Error('تعذّر حفظ السعر');
  }
  // قاعدة «و»: التعديل على صف مش موجود بينجح ويرجّع صفر صفوف.
  if (!saved || saved.length === 0) {
    throw new Error('الحفظ مروّحش للقاعدة — المنطقة مش موجودة أو الصلاحيات مش سامحة.');
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: params.id ? 'shipping_rate_updated' : 'shipping_rate_created',
    entityType: 'ShippingRate',
    entityId: params.id ?? `${gov}/${area}`,
    metadata: { governorate: gov, city: area, fee: params.fee, isActive: params.isActive },
  });

  revalidatePath('/dashboard/admin/settings/shipping');
  revalidatePath('/enha-lak/checkout');
  return { ok: true };
}

/**
 * Removing an area.
 *
 * Orders already placed keep the fee that was charged at the time — it is
 * stored on the order itself — so deleting an area never changes a past order.
 */
export async function deleteShippingRate(id: string) {
  const admin = await requireOrdersAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from('shipping_rates').delete().eq('id', id);
  if (error) {
    console.error('Error deleting shipping rate', error);
    throw new Error('تعذّر حذف المنطقة');
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: 'shipping_rate_deleted',
    entityType: 'ShippingRate',
    entityId: id,
  });

  revalidatePath('/dashboard/admin/settings/shipping');
  revalidatePath('/enha-lak/checkout');
  return { ok: true };
}

/** Raising or lowering every area in one governorate at once. */
export async function adjustShippingRatesByGovernorate(governorate: string, delta: number) {
  const admin = await requireOrdersAdmin();
  if (!Number.isFinite(delta) || delta === 0) throw new Error('اكتب قيمة التعديل');

  const supabase = await createClient();
  const { data: rates } = await supabase
    .from('shipping_rates')
    .select('id, fee')
    .eq('governorate', governorate);

  if (!rates?.length) throw new Error('لا توجد مناطق في هذه المحافظة');

  // ⚠️ الحلقة دي كانت `await` **عارية**: مفيش فحص خطأ ولا عدد صفوف.
  //    فلو صف أو اتنين فشلوا، الإدارة بتشوف «تم» والأسعار **نصها
  //    اتغيّر ونصها لأ** — وده أسوأ من فشل كامل، لأن محدّش هيعرف
  //    أنهي منهم اتغيّر.
  let changed = 0;
  for (const rate of rates) {
    const next = Math.max(0, rate.fee + delta);
    const { data, error } = await supabase
      .from('shipping_rates')
      .update({ fee: next, updated_at: new Date().toISOString() })
      .eq('id', rate.id)
      .select('id');

    if (error) {
      console.error('Error adjusting shipping rate', error);
      throw new Error(
        `اتغيّرت ${changed} منطقة من ${rates.length}، وبعدين وقف. راجع الأسعار قبل ما تعيد.`,
      );
    }
    if (data && data.length > 0) changed += 1;
  }

  if (changed === 0) {
    throw new Error('ولا سعر اتغيّر — راجع الصلاحيات.');
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: 'shipping_rates_bulk_adjusted',
    entityType: 'ShippingRate',
    entityId: governorate,
    metadata: { governorate, delta, areas: rates.length },
  });

  revalidatePath('/dashboard/admin/settings/shipping');
  revalidatePath('/enha-lak/checkout');
  return { ok: true, updated: rates.length };
}
