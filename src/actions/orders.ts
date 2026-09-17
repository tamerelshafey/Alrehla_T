'use server';
import { requireUser, requireAdmin } from '@/lib/auth-guard';

import { revalidatePath } from 'next/cache';

import { logAuditAction } from '@/lib/audit';

import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/types/supabase';

export type ShippingDetails = {
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  city: string;
  governorate: string;
  notes?: string;
};

/**
 * إنشاء طلب.
 *
 * ⚠️ الواجهة **ما بتبعتش أسعار**. بتبعت إيه اتطلب وكام واحد بس، والقاعدة
 * بتحسب الباقي.
 *
 * ليه كده: قبل التعديل ده كانت الواجهة بتبعت سعر كل صنف والشحن
 * والإجمالي، والخادم بيكتبهم زي ما وصلوا. أي حد يكلّم القاعدة مباشرة
 * (والمفتاح العام موجود في كود المتصفح بطبيعته) كان يقدر يشتري بأي
 * رقم. ومحفّز `guard_order_fields` بيجمّد المبلغ بعد الإنشاء — يعني
 * الرقم الغلط كان بيتقفل عليه ويبان سليم.
 *
 * دلوقتي الطلب كله بيتعمل في دالة واحدة جوه القاعدة
 * (`create_customer_order`): بتجيب السعر من جدول المنتجات، والشحن من
 * جدول المناطق، وبتكتب الطلب وعناصره في عملية واحدة — لو أي خطوة فشلت
 * مفيش حاجة بتتكتب.
 */
export type NewOrderItem = {
  /** رقم المنتج الحقيقي — مش رقم سطر العربة. */
  productId: string;
  quantity: number;
  customizationData?: unknown;
};

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createOrder(
  items: NewOrderItem[],
  shipping?: ShippingDetails,
): Promise<CreateOrderResult> {
  await requireUser();

  if (!items.length) return { ok: false, error: 'العربة فاضية' };

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('create_customer_order', {
    p_items: items.map((item) => ({
      product_id: item.productId,
      quantity: Math.max(1, Math.trunc(item.quantity) || 1),
      customization_data: (item.customizationData ?? null) as Json,
    })),
    p_shipping: shipping
      ? {
          recipientName: shipping.recipientName?.trim() ?? '',
          recipientPhone: shipping.recipientPhone?.trim() ?? '',
          addressLine: shipping.addressLine?.trim() ?? '',
          city: shipping.city?.trim() ?? '',
          governorate: shipping.governorate?.trim() ?? '',
          notes: shipping.notes?.trim() ?? '',
        }
      : null,
  });

  if (error || !data) {
    console.error('Error creating order:', error);
    // رسالة القاعدة نفسها بتوصل للعميل: «منطقة الشحن مش مسجّلة» أنفع
    // من «تعذّر إنشاء الطلب».
    return { ok: false, error: error?.message ?? 'تعذّر إنشاء الطلب' };
  }

  return { ok: true, orderId: data as unknown as string };
}

/**
 * العميل بيقول «حوّلت» ويسيب رقم العملية.
 *
 * التحقق هنا بيدّي رسالة مفهومة؛ الحارس الحقيقي هو محفّز `guard_order_fields`
 * في قاعدة البيانات، اللي بيسمح بانتقال واحد بس: قيد الانتظار →
 * بانتظار التأكيد. «مدفوع» قرار الإدارة وحدها.
 */
export async function submitPaymentProof(orderId: string, transactionReference: string) {
  const user = await requireUser();

  const reference = transactionReference.trim();
  if (!reference) {
    return { success: false, error: 'اكتب رقم عملية التحويل' };
  }

  const supabase = await createClient();

  // الطلب ده بتاعه أصلًا؟ الصلاحيات بترفض غير كده، بس الرسالة بتبقى أوضح.
  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, status')
    .eq('id', orderId)
    .maybeSingle();

  if (!order || order.user_id !== user.id) {
    return { success: false, error: 'الطلب غير موجود' };
  }
  if (order.status !== 'pending') {
    return { success: false, error: 'تم إرسال إثبات الدفع لهذا الطلب بالفعل' };
  }

  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'awaiting_verification',
      transaction_reference: reference 
    })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating payment proof:', error);
    return { success: false, error: 'Order not found or update failed' };
  }

  revalidatePath('/enha-lak/checkout');
  revalidatePath('/account/orders/enha-lak');
  revalidatePath('/dashboard/admin/orders');
  return { success: true };
}

/**
 * الإدارة بتأكّد إنها شافت التحويل.
 *
 * دي كانت أخطر دالة في المشروع: كانت بتحوّل الطلب لـ«مدفوع» من غير أي
 * تحقق، وصلاحية الجدول بتسمح للعميل يعدّل طلبه — فالعميل كان يقدر
 * يأكّد دفع نفسه من غير ما يدفع.
 */
export async function confirmOrderPayment(orderId: string) {
  const currentUser = await requireAdmin(
    'canManageOrders',
    'تأكيد الدفع متاح للإدارة فقط',
  );

  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', orderId);

  if (error) {
    console.error('Error confirming payment:', error);
    return { success: false, error: 'Order not found or update failed' };
  }

  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: 'order_payment_confirmed',
    entityType: 'Order',
    entityId: orderId,
    metadata: { orderId }
  });

  revalidatePath('/enha-lak/checkout');
  revalidatePath('/account/orders/enha-lak');
  revalidatePath('/dashboard/admin/orders');
  return { success: true };
}
