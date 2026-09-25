'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { getCurrentUser } from '@/data/domains/auth';
import { getMyPublisher } from '@/data/domains/products';
import { hasAdminPermission } from '@/lib/utils';
import {
  customerPriceFromCost,
  NEUTRAL_FORMULA,
  type PricingFormula,
} from '@/lib/publisher-pricing';

/**
 * حفظ منتج — من لوحة الإدارة أو من لوحة الناشر.
 *
 * التحقق هنا كان **مفقود بالكامل**: الدالة كانت بتاخد رقم الناشر من حقل
 * مخفي في الفورم وتكتب بيه من غير ما تسأل مين اللي بيحفظ. يعني أي حساب
 * مسجّل كان يقدر يعدّل أي منتج وينسبه لأي ناشر — والحماية الوحيدة كانت
 * صلاحيات قاعدة البيانات.
 *
 * دلوقتي: الإدارة تعدّل أي حاجة، والناشر منتجاته هو بس، وأي حد تاني
 * بيترفض.
 */
export async function saveProduct(formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get('id') as string;
  const isNew = !id;
  
  const name = formData.get('name') as string;
  const category = formData.get('category') as 'library' | 'custom' | 'subscription';
  // ⚠️ **الرقم اللي بيوصل من الناشر هو نصيبه، مش سعر العميل.**
  //    سعر العميل بيتحسب تحت من معادلة `publisher-default`. أما
  //    الإدارة فبتكتب سعر منتج المنصة مباشرة — مفيش ناشر ياخد منه.
  const rawPrice = Number(formData.get('price'));
  const publisherCostRaw = formData.get('publisherCost');
  const publisherCost =
    publisherCostRaw !== null && publisherCostRaw !== ''
      ? Number(publisherCostRaw)
      : null;
  let price = rawPrice;
  const electronicPrice = formData.get('electronicPrice') ? Number(formData.get('electronicPrice')) : null;
  const shortDescription = formData.get('shortDescription') as string;
  const coverImageUrl = formData.get('coverImageUrl') as string || null;
  const publisherId = formData.get('publisherId') as string || null;
  const ownerType = formData.get('ownerType') as 'platform' | 'publisher';

  const currentUser = await getCurrentUser();
  const isAdmin = hasAdminPermission(currentUser, 'canManageCatalog');
  let effectivePublisherId = publisherId;

  if (!isAdmin) {
    // مش إداري؟ يبقى لازم يكون ناشر، والمنتج لازم يكون بتاعه.
    const myPublisher = await getMyPublisher();
    if (!myPublisher) throw new Error('غير مصرح لك بحفظ المنتجات');

    // رقم الناشر بيتاخد من الحساب، مش من الفورم.
    effectivePublisherId = myPublisher.id;

    if (!isNew) {
      const { data: existing } = await supabase
        .from('personalized_products')
        .select('publisher_id')
        .eq('id', id)
        .maybeSingle();

      if (!existing || existing.publisher_id !== myPublisher.id) {
        throw new Error('غير مصرح لك بتعديل هذا المنتج');
      }
    }
  }
  
  // Basic slug generation
  const slug = isNew ? `prod-${Date.now()}` : formData.get('slug') as string || `prod-${Date.now()}`;
  
  // ── سعر العميل من نصيب الناشر ─────────────────────────────
  //
  // ⚠️ **المعادلة بتتقري من القاعدة في كل حفظة، مش من المتصفح**
  //    (قاعدة «ف»). لو الناشر بعت المعامل مع الفورم، كان يقدر
  //    يبعت 1 ويلغي هامش المنصة كله من شاشته.
  let effectiveCost: number | null = null;

  if (ownerType === 'publisher') {
    if (publisherCost === null || !Number.isFinite(publisherCost) || publisherCost <= 0) {
      throw new Error('اكتب نصيبك من النسخة الواحدة — رقم أكبر من صفر');
    }

    const { data: formulaRow } = await supabase
      .from('pricing_formula_settings')
      .select('platform_multiplier, fixed_admin_fee')
      .eq('id', 'publisher-default')
      .maybeSingle();

    const formula: PricingFormula = formulaRow
      ? {
          platformMultiplier: formulaRow.platform_multiplier,
          fixedAdminFee: formulaRow.fixed_admin_fee,
        }
      : NEUTRAL_FORMULA;

    effectiveCost = Math.round(publisherCost);
    price = customerPriceFromCost(effectiveCost, formula);
  }

  const dbPayload = {
    slug,
    name,
    category,
    price,
    publisher_cost: effectiveCost,
    electronic_price: electronicPrice,
    short_description: shortDescription,
    cover_image_url: coverImageUrl,
    publisher_id: effectivePublisherId,
    owner_type: ownerType,
  };

  let savedId = id;

  if (isNew) {
    const { data, error } = await supabase
      .from('personalized_products')
      .insert([dbPayload])
      .select('id')
      .single();
      
    if (error) {
      console.error('Error inserting product:', error);
      throw new Error('Failed to create product');
    }
    savedId = data.id;
  } else {
    const { error } = await supabase
      .from('personalized_products')
      .update(dbPayload)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: isNew ? 'product_created' : 'product_updated',
    entityType: 'PersonalizedProduct',
    entityId: savedId,
    metadata: { name }
  });

  revalidatePath('/dashboard/admin/products');
  revalidatePath('/dashboard/publisher/products');
  revalidatePath('/enha-lak/library');
  revalidatePath('/enha-lak/custom');
}
