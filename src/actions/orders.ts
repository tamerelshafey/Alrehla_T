'use server';
import { requireUser, requireAdmin } from '@/lib/auth-guard';

import { revalidatePath } from 'next/cache';
import { OrderItem } from '@/types';
import { logAuditAction } from '@/lib/audit';

import { createClient } from '@/lib/supabase/server';

export type ShippingDetails = {
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  city: string;
  governorate: string;
  notes?: string;
};

/**
 * Creating an order.
 *
 * The shipping address used to be collected on screen — name, phone, address,
 * city and governorate, all marked required — and then thrown away: the order
 * row carried only a user id, a total and a status. A printed book was ordered
 * with nowhere to send it.
 */
export async function createDummyOrder(
  items: OrderItem[],
  totalAmount: number,
  shipping?: ShippingDetails,
  shippingFee = 0
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      status: 'pending',
      recipient_name: shipping?.recipientName?.trim() || null,
      recipient_phone: shipping?.recipientPhone?.trim() || null,
      address_line: shipping?.addressLine?.trim() || null,
      city: shipping?.city?.trim() || null,
      governorate: shipping?.governorate?.trim() || null,
      shipping_notes: shipping?.notes?.trim() || null,
      shipping_fee: shippingFee,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Error creating order:', orderError);
    throw new Error('Failed to create order');
  }

  // Validate childIds if recipientType is child
  const childIds = items
    .filter(i => i.customizationData?.recipientType === 'child' && i.customizationData?.childId)
    .map(i => i.customizationData!.childId!);
    
  if (childIds.length > 0) {
    const { data: validChildren } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('user_profile_id', user.id)
      .in('id', childIds);
      
    const validChildIds = new Set(validChildren?.map(c => c.id) || []);
    for (const childId of childIds) {
      if (!validChildIds.has(childId)) {
        throw new Error(`Invalid child ID: ${childId}. It does not belong to the current user.`);
      }
    }
  }

  const orderItemsPayload = items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    customization_data: item.customizationData as any
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw new Error('Failed to add order items');
  }

  return order.id;
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
