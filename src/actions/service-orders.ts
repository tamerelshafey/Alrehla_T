'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Ordering a standalone creative service.
 *
 * Creative services are deliberately kept out of the products cart: the
 * database models them separately (service_orders, not orders/order_items),
 * and a service tied to one instructor at one price behaves more like a
 * booking than a basket item.
 *
 * Payment is the same manual transfer flow the rest of the platform uses —
 * the customer transfers, gives the reference, and an admin verifies.
 */
export async function createServiceOrder(params: {
  serviceId: string;
  instructorId?: string | null;
  transactionReference?: string | null;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('يجب تسجيل الدخول أولاً');

  const { serviceId, instructorId, transactionReference } = params;

  const { data: service, error: serviceError } = await supabase
    .from('standalone_services')
    .select('id, price, price_type')
    .eq('id', serviceId)
    .single();

  if (serviceError || !service) throw new Error('الخدمة غير موجودة');

  // The amount is never taken from the browser. For a per-instructor service
  // it comes from that instructor's approved offer; otherwise from the
  // service's own price. A tampered form cannot change what is charged.
  let amount = service.price;

  if (service.price_type === 'starts_from') {
    if (!instructorId) throw new Error('يجب اختيار مدرب لهذه الخدمة');

    const { data: offer, error: offerError } = await supabase
      .from('instructor_services')
      .select('approved_price')
      .eq('service_id', serviceId)
      .eq('instructor_id', instructorId)
      .eq('status', 'approved')
      .eq('is_active', true)
      .single();

    if (offerError || !offer || offer.approved_price == null) {
      throw new Error('هذا المدرب لا يقدم الخدمة حالياً');
    }
    amount = offer.approved_price;
  }

  const { data: order, error } = await supabase
    .from('service_orders')
    .insert({
      buyer_profile_id: user.id,
      standalone_service_id: serviceId,
      instructor_id: instructorId ?? null,
      amount,
      status: transactionReference ? 'awaiting_verification' : 'pending',
      transaction_reference: transactionReference || null,
    })
    .select('id')
    .single();

  if (error || !order) {
    console.error('Error creating service order', error);
    throw new Error('تعذّر إنشاء الطلب');
  }

  revalidatePath('/account/orders/creative-writing');
  revalidatePath('/dashboard/admin/orders/services');

  return { ok: true, orderId: order.id, amount };
}
