'use server';
import { requireAdmin } from '@/lib/auth-guard';

import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { createClient } from '@/lib/supabase/server';

/**
 * Managing the standalone creative services ("الخدمات الإبداعية").
 *
 * The admin screen used to be a read-only table: there was no way to add,
 * rename, reprice or remove a service from inside the site at all.
 */

/** يفوّض للقاعدة الموحّدة في `@/lib/auth-guard` — التنفيذ واحد، والرسالة خاصة بهذا المجال. */
async function requireCatalogAdmin() {
  return requireAdmin('canManageCatalog', 'غير مصرح لك بإدارة الخدمات');
}

export interface ServiceInput {
  name: string;
  price: number;
  description: string;
  category: string;
  priceType: 'fixed' | 'starts_from';
  sortOrder: number | null;
}

function validate(input: ServiceInput) {
  const name = input.name.trim();
  if (!name) throw new Error('اسم الخدمة مطلوب');
  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error('السعر غير صحيح');
  }
  return {
    name,
    price: input.price,
    description: input.description.trim() || null,
    category: input.category.trim() || null,
    price_type: input.priceType,
    sort_order: input.sortOrder,
  };
}

export async function createStandaloneService(input: ServiceInput) {
  const user = await requireCatalogAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('standalone_services')
    .insert(validate(input))
    .select('id')
    .single();

  if (error || !data) {
    console.error('Error creating standalone service', error);
    throw new Error('تعذّر إضافة الخدمة');
  }

  await logAuditAction({
    actorProfileId: user.id,
    actorName: user.fullName,
    action: 'standalone_service_created',
    entityType: 'StandaloneService',
    entityId: data.id,
    metadata: { name: input.name, price: input.price },
  });

  revalidatePath('/dashboard/admin/writing/services');
  revalidatePath('/creative-writing/services');
  revalidatePath('/creative-writing');
  return { success: true };
}

export async function updateStandaloneService(id: string, input: ServiceInput) {
  const user = await requireCatalogAdmin();
  const supabase = await createClient();

  const { data: saved, error } = await supabase
    .from('standalone_services')
    .update(validate(input))
    .eq('id', id)
    .select('id');

  if (error) {
    console.error('Error updating standalone service', error);
    throw new Error('تعذّر حفظ التعديل');
  }
  if (!saved || saved.length === 0) {
    throw new Error('الخدمة مش موجودة — التعديل مروّحش للقاعدة.');
  }

  await logAuditAction({
    actorProfileId: user.id,
    actorName: user.fullName,
    action: 'standalone_service_updated',
    entityType: 'StandaloneService',
    entityId: id,
    metadata: { name: input.name, price: input.price },
  });

  revalidatePath('/dashboard/admin/writing/services');
  revalidatePath('/creative-writing/services');
  revalidatePath('/creative-writing');
  return { success: true };
}

/**
 * Removing a service.
 *
 * A service that has been ordered, or that instructors are offering, is not
 * deleted: removing it would break those records. The admin is told why.
 */
export async function deleteStandaloneService(id: string) {
  const user = await requireCatalogAdmin();
  const supabase = await createClient();

  const { count: orderCount } = await supabase
    .from('service_orders')
    .select('id', { count: 'exact', head: true })
    .eq('standalone_service_id', id);

  if (orderCount && orderCount > 0) {
    throw new Error(
      `لا يمكن حذف الخدمة لأن عليها ${orderCount} طلب مسجّل. يمكنك تعديلها بدل حذفها.`
    );
  }

  const { count: offerCount } = await supabase
    .from('instructor_services')
    .select('id', { count: 'exact', head: true })
    .eq('service_id', id);

  if (offerCount && offerCount > 0) {
    throw new Error(
      `لا يمكن حذف الخدمة لأن ${offerCount} مدرب مسنَدة له. احذف الإسناد أولاً من صفحة المدرب.`
    );
  }

  const { error } = await supabase.from('standalone_services').delete().eq('id', id);

  if (error) {
    console.error('Error deleting standalone service', error);
    throw new Error('تعذّر حذف الخدمة');
  }

  await logAuditAction({
    actorProfileId: user.id,
    actorName: user.fullName,
    action: 'standalone_service_deleted',
    entityType: 'StandaloneService',
    entityId: id,
  });

  revalidatePath('/dashboard/admin/writing/services');
  revalidatePath('/creative-writing/services');
  revalidatePath('/creative-writing');
  return { success: true };
}
