'use server';
import { requireAdmin } from '@/lib/auth-guard';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { hasAdminPermission, calculateFinalSessionPrice } from '@/lib/utils';
import { notifyUser, getInstructorUserId } from '@/lib/notifications';

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
  // What the instructor keeps. The customer pays the platform formula on top,
  // exactly as with session pricing.
  let instructorEarning: number | null = null;

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
    instructorEarning = offer.approved_price;

    const { data: formula } = await supabase
      .from('pricing_formula_settings')
      .select('platform_multiplier, fixed_admin_fee')
      .eq('id', 'default')
      .maybeSingle();

    // No formula readable means no guessing: charge the instructor's price
    // rather than invent a margin.
    amount = formula
      ? calculateFinalSessionPrice(instructorEarning, {
          platformMultiplier: formula.platform_multiplier,
          fixedAdminFee: formula.fixed_admin_fee,
        })
      : instructorEarning;
  }

  const { data: order, error } = await supabase
    .from('service_orders')
    .insert({
      buyer_profile_id: user.id,
      standalone_service_id: serviceId,
      instructor_id: instructorId ?? null,
      amount,
      instructor_earning: instructorEarning,
      status: transactionReference ? 'awaiting_verification' : 'pending',
      transaction_reference: transactionReference || null,
    })
    .select('id')
    .single();

  if (error || !order) {
    console.error('Error creating service order', error);
    throw new Error('تعذّر إنشاء الطلب');
  }

  if (instructorId) {
    await notifyUser({
      recipientProfileId: await getInstructorUserId(instructorId),
      title: 'طلب خدمة جديد',
      message: 'وصلك طلب خدمة إبداعية جديد. سيظهر للتنفيذ بعد تأكيد الدفع.',
      link: `/dashboard/instructor/services/orders/${order.id}`,
    });
  }

  revalidatePath('/account/orders/creative-writing');
  revalidatePath('/dashboard/admin/orders/services');

  return { ok: true, orderId: order.id, amount };
}

/* ================================================================
 * دورة حياة الطلب بعد الدفع
 * ================================================================
 * مَن ينقل الطلب من حالة لأخرى مفروض في قاعدة البيانات أيضًا؛ الفحوص هنا
 * لرسالة خطأ واضحة، لا لأنها الحارس الوحيد.
 */

async function loadOrderFor(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('يجب تسجيل الدخول أولاً');

  const { data: order } = await supabase
    .from('service_orders')
    .select('id, buyer_profile_id, instructor_id, status, amount, instructor_earning, standalone_service_id')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) throw new Error('الطلب غير موجود');
  return { supabase, user, order };
}

async function isAssignedInstructor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  instructorId: string | null,
  userId: string
) {
  if (!instructorId) return false;
  const { data } = await supabase
    .from('instructors')
    .select('id')
    .eq('id', instructorId)
    .eq('user_id', userId)
    .maybeSingle();
  return Boolean(data);
}

function revalidateOrder(orderId: string) {
  revalidatePath(`/account/orders/creative-writing/${orderId}`);
  revalidatePath('/account/orders/creative-writing');
  revalidatePath(`/dashboard/instructor/services/orders/${orderId}`);
  revalidatePath('/dashboard/instructor/services');
  revalidatePath(`/dashboard/admin/orders/services/${orderId}`);
  revalidatePath('/dashboard/admin/orders/services');
  revalidatePath('/dashboard/admin');
}

/** رسالة في محادثة الطلب. */
export async function sendServiceOrderMessage(
  orderId: string,
  body: string,
  isDelivery = false
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('يجب تسجيل الدخول أولاً');

  const text = body.trim();
  if (!text) throw new Error('اكتب رسالة أولاً');
  if (text.length > 4000) throw new Error('الرسالة طويلة جدًا');

  const { error } = await supabase.from('service_order_messages').insert({
    order_id: orderId,
    sender_profile_id: user.id,
    body: text,
    is_delivery: isDelivery,
  });

  if (error) {
    console.error('Error sending order message', error);
    throw new Error('تعذّر إرسال الرسالة');
  }

  // The other side of the conversation hears about it.
  const { data: order } = await supabase
    .from('service_orders')
    .select('buyer_profile_id, instructor_id')
    .eq('id', orderId)
    .maybeSingle();

  if (order && !isDelivery) {
    const instructorUserId = order.instructor_id
      ? await getInstructorUserId(order.instructor_id)
      : null;
    const recipient =
      user.id === order.buyer_profile_id ? instructorUserId : order.buyer_profile_id;
    const link =
      user.id === order.buyer_profile_id
        ? `/dashboard/instructor/services/orders/${orderId}`
        : `/account/orders/creative-writing/${orderId}`;

    await notifyUser({
      recipientProfileId: recipient,
      title: 'رسالة جديدة على طلب خدمة',
      message: text.slice(0, 120),
      link,
    });
  }

  revalidateOrder(orderId);
  return { ok: true };
}

/** المدرب يبدأ التنفيذ. */
export async function startServiceOrder(orderId: string) {
  const { supabase, user, order } = await loadOrderFor(orderId);

  if (!(await isAssignedInstructor(supabase, order.instructor_id, user.id))) {
    throw new Error('هذا الطلب ليس مسنَدًا إليك');
  }
  if (order.status !== 'paid') {
    throw new Error('لا يمكن بدء التنفيذ قبل تأكيد الدفع');
  }

  const { error } = await supabase
    .from('service_orders')
    .update({ status: 'in_progress' })
    .eq('id', orderId);

  if (error) throw new Error('تعذّر تحديث حالة الطلب');

  await notifyUser({
    recipientProfileId: order.buyer_profile_id,
    title: 'بدأ تنفيذ طلبك',
    message: 'المدرب بدأ العمل على طلبك.',
    link: `/account/orders/creative-writing/${orderId}`,
  });

  revalidateOrder(orderId);
  return { ok: true };
}

/**
 * المدرب يسلّم العمل.
 *
 * يُشترط رسالة تسليم فعلية: "تم التسليم" بلا شيء يقابله عند العميل هو بالضبط
 * ما يجعل الطلب يعلق بعد ذلك.
 */
export async function deliverServiceOrder(orderId: string, deliveryMessage: string) {
  const { supabase, user, order } = await loadOrderFor(orderId);

  if (!(await isAssignedInstructor(supabase, order.instructor_id, user.id))) {
    throw new Error('هذا الطلب ليس مسنَدًا إليك');
  }
  if (order.status !== 'in_progress' && order.status !== 'paid') {
    throw new Error('لا يمكن التسليم في هذه الحالة');
  }

  const text = deliveryMessage.trim();
  if (text.length < 10) {
    throw new Error('اكتب رسالة التسليم للعميل (ما الذي سلّمته وأين يجده)');
  }

  await sendServiceOrderMessage(orderId, text, true);

  const { error } = await supabase
    .from('service_orders')
    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw new Error('تعذّر تسجيل التسليم');

  await notifyUser({
    recipientProfileId: order.buyer_profile_id,
    title: 'تم تسليم طلبك',
    message: 'راجع ما سلّمه المدرب وأكّد الاستلام.',
    link: `/account/orders/creative-writing/${orderId}`,
  });

  revalidateOrder(orderId);
  return { ok: true };
}

/**
 * تسجيل مستحق المدرب عند اكتمال الطلب.
 *
 * الفهرس الفريد في قاعدة البيانات يمنع تسجيل نفس الطلب مرتين، فحتى لو
 * اكتمل الطلب مرتين بأي طريقة لا يُدفع مرتين.
 */
async function recordInstructorEarning(
  supabase: Awaited<ReturnType<typeof createClient>>,
  order: {
    id: string;
    instructor_id: string | null;
    instructor_earning: number | null;
    amount: number;
  },
  serviceName: string
) {
  if (!order.instructor_id) return;

  const earning = order.instructor_earning ?? order.amount;
  if (!earning || earning <= 0) return;

  const period = new Date().toISOString().slice(0, 7); // YYYY-MM

  const { error } = await supabase.from('instructor_payouts').insert({
    instructor_id: order.instructor_id,
    period,
    amount: Math.round(earning),
    status: 'pending',
    source_type: 'service_order',
    source_id: order.id,
    description: serviceName,
  });

  // A duplicate is the unique index doing its job, not a failure.
  if (error && !String(error.message).toLowerCase().includes('duplicate')) {
    console.error('Error recording instructor earning', error);
  }
}

async function completeOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  order: {
    id: string;
    instructor_id: string | null;
    instructor_earning: number | null;
    amount: number;
    standalone_service_id: string | null;
  }
) {
  const { data: service } = order.standalone_service_id
    ? await supabase
        .from('standalone_services')
        .select('name')
        .eq('id', order.standalone_service_id)
        .maybeSingle()
    : { data: null };

  const { error } = await supabase
    .from('service_orders')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', order.id);

  if (error) throw new Error('تعذّر إقفال الطلب');

  await recordInstructorEarning(supabase, order, service?.name ?? 'خدمة إبداعية');

  if (order.instructor_id) {
    await notifyUser({
      recipientProfileId: await getInstructorUserId(order.instructor_id),
      title: 'اكتمل الطلب',
      message: 'تم تأكيد الاستلام، وأُضيفت حصيلتك إلى مستحقاتك.',
      link: '/dashboard/instructor/payouts',
    });
  }
}

/** العميل يؤكد استلام العمل. */
export async function confirmServiceOrderReceipt(orderId: string) {
  const { supabase, user, order } = await loadOrderFor(orderId);

  if (order.buyer_profile_id !== user.id) {
    throw new Error('هذا الطلب ليس طلبك');
  }
  if (order.status !== 'delivered') {
    throw new Error('لم يُسلَّم هذا الطلب بعد');
  }

  await completeOrder(supabase, order);

  revalidateOrder(orderId);
  return { ok: true };
}

/* ---------------- الإدارة ---------------- */

/** يفوّض للقاعدة الموحّدة في `@/lib/auth-guard` — التنفيذ واحد، والرسالة خاصة بهذا المجال. */
async function requireOrdersAdmin() {
  return requireAdmin('canManageOrders', 'غير مصرح لك بإدارة الطلبات');
}

/** تأكيد استلام المبلغ. */
export async function confirmServiceOrderPayment(orderId: string) {
  const admin = await requireOrdersAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('service_orders')
    .update({ status: 'paid' })
    .eq('id', orderId);

  if (error) throw new Error('تعذّر تأكيد الدفع');

  const { data: order } = await supabase
    .from('service_orders')
    .select('buyer_profile_id, instructor_id')
    .eq('id', orderId)
    .maybeSingle();

  if (order) {
    await notifyUser({
      recipientProfileId: order.buyer_profile_id,
      title: 'تم تأكيد دفعك',
      message: 'استلمنا المبلغ، والمدرب سيبدأ التنفيذ.',
      link: `/account/orders/creative-writing/${orderId}`,
    });
    if (order.instructor_id) {
      await notifyUser({
        recipientProfileId: await getInstructorUserId(order.instructor_id),
        title: 'طلب جاهز للتنفيذ',
        message: 'تم تأكيد الدفع — يمكنك بدء التنفيذ الآن.',
        link: `/dashboard/instructor/services/orders/${orderId}`,
      });
    }
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: 'service_order_payment_confirmed',
    entityType: 'ServiceOrder',
    entityId: orderId,
  });

  revalidateOrder(orderId);
  return { ok: true };
}

/**
 * الإدارة تقفل طلبًا سلّمه المدرب ولم يؤكده العميل.
 *
 * لا يحدث هذا تلقائيًا بمرور الوقت: صمت العميل إشارة على احتمال وجود مشكلة،
 * لا موافقة ضمنية — فيقرأه إنسان ويقرر.
 */
export async function closeServiceOrderByAdmin(orderId: string, reason: string) {
  const admin = await requireOrdersAdmin();
  const { supabase, order } = await loadOrderFor(orderId);

  if (order.status !== 'delivered') {
    throw new Error('هذا الطلب ليس في حالة "تم التسليم"');
  }
  if (!reason.trim()) {
    throw new Error('اكتب سبب الإقفال');
  }

  await completeOrder(supabase, order);

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: 'service_order_closed_by_admin',
    entityType: 'ServiceOrder',
    entityId: orderId,
    metadata: { reason: reason.trim() },
  });

  revalidateOrder(orderId);
  return { ok: true };
}

/** استرجاع أو إلغاء — بقرار من الإدارة وبسبب مسجَّل. */
export async function setServiceOrderStatusByAdmin(
  orderId: string,
  status: 'refunded' | 'cancelled',
  reason: string
) {
  const admin = await requireOrdersAdmin();
  if (!reason.trim()) throw new Error('اكتب السبب');

  const supabase = await createClient();
  const { error } = await supabase
    .from('service_orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw new Error('تعذّر تحديث حالة الطلب');

  const { data: target } = await supabase
    .from('service_orders')
    .select('buyer_profile_id')
    .eq('id', orderId)
    .maybeSingle();

  await notifyUser({
    recipientProfileId: target?.buyer_profile_id,
    title: status === 'refunded' ? 'تم استرجاع طلبك' : 'تم إلغاء طلبك',
    message: reason.trim(),
    link: `/account/orders/creative-writing/${orderId}`,
  });

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: status === 'refunded' ? 'service_order_refunded' : 'service_order_cancelled',
    entityType: 'ServiceOrder',
    entityId: orderId,
    metadata: { reason: reason.trim() },
  });

  revalidateOrder(orderId);
  return { ok: true };
}
