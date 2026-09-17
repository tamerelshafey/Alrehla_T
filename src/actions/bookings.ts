
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { notifyAdmins } from '@/lib/notifications';
import { getCurrentUser } from '@/data/domains/auth';

export type BookingResult =
  | { ok: true; subscriptionId: string; paymentReference: string }
  | { ok: false; error: string };

/**
 * حجز مسار الكتابة الإبداعية.
 *
 * اللي كان بيحصل قبل كده:
 *   • الواجهة بتبعت مبلغ (250 مكتوبة في الكود) والدالة بتتجاهله — ومفيش
 *     عمود مبلغ في الجدول أصلًا، فالإدارة بتأكد دفع بلا رقم.
 *   • رقم الباقة اللي بيتخزن كان **اسم** الباقة، لأن قايمة الباقات في
 *     المعالج كانت تلات أسماء مكتوبة في الكود.
 *   • أول جلسة بتتعمل تلقائيًا بتاريخ «بعد 3 أيام» مخترع، ولو فشلت
 *     بيتم تجاهل الفشل.
 *
 * دلوقتي: دالة في القاعدة بتتأكد إن الباقة موجودة ومفعّلة، وبتاخد
 * السعر منها، وبتتأكد إن المدرب مفعّل وإن المشارك يخص صاحب الحساب.
 * والجدولة بتحصل بعد تأكيد الدفع بتاريخ حقيقي.
 */
export async function createCourseBooking(params: {
  packageId: string;
  instructorId?: string;
  participantType: 'self' | 'child';
  childId?: string;
}): Promise<BookingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'لازم تسجّل الدخول قبل الحجز' };

  const { data, error } = await supabase.rpc('create_course_booking', {
    p_package_id: params.packageId,
    p_instructor_id: params.instructorId || null,
    p_participant_type: params.participantType,
    p_child_id: params.childId || null,
  });

  if (error || !data) {
    console.error('Error creating booking:', error);
    return { ok: false, error: error?.message ?? 'تعذّر تسجيل الحجز' };
  }

  const subscriptionId = data as unknown as string;

  // الرقم المرجعي بيتولّد في القاعدة مع الحجز، والعميل بيكتبه في ملاحظة
  // التحويل.
  const { data: row } = await supabase
    .from('course_subscriptions')
    .select('payment_reference')
    .eq('id', subscriptionId)
    .maybeSingle();

  revalidatePath('/account/orders/creative-writing');
  revalidatePath('/dashboard/admin/bookings');
  return {
    ok: true,
    subscriptionId,
    paymentReference: row?.payment_reference ?? '',
  };
}

export async function submitBookingPaymentProof(
  subscriptionId: string,
  payment: { method: 'instapay' | 'vodafone_cash'; receiptUrl: string },
) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (user.role === 'visitor') {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: sub } = await supabase
    .from('course_subscriptions')
    .select('user_id')
    .eq('id', subscriptionId)
    .single();

  if (!sub || sub.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }
  
  // إثبات الدفع كان بيترمي هنا بالكامل: الحالة بتتغيّر ومفيش مرجع ولا
  // إيصال. دلوقتي وسيلة الدفع وصورة الإيصال بيتخزنوا، والرقم المرجعي
  // بتاعنا اتولّد مع الحجز.
  const { error } = await supabase
    .from('course_subscriptions')
    .update({
      status: 'awaiting_verification',
      payment_method: payment.method,
      payment_receipt_url: payment.receiptUrl,
    })
    .eq('id', subscriptionId);

  if (error) {
    console.error('Error submitting payment proof:', error);
    return { success: false, error: 'Failed' };
  }

  await notifyAdmins({
    title: 'إثبات دفع حجز بانتظار المراجعة',
    message: 'عميل رفع إيصال تحويل لحجز باقة كتابة.',
    link: `/dashboard/admin/bookings/${subscriptionId}`,
  });

  revalidatePath('/creative-writing/booking/confirm');
  revalidatePath('/account/orders/creative-writing');
  revalidatePath('/dashboard/admin/bookings');
  
  return { success: true };
}

export async function confirmBookingPayment(subscriptionId: string) {
  const user = await getCurrentUser();
  if (user.role !== 'super_admin' && user.role !== 'general_supervisor') {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('course_subscriptions')
    .update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', subscriptionId);

  if (error) {
    console.error('Error confirming payment:', error);
    return { success: false };
  }

  await logAuditAction({
    actorProfileId: user.id,
    actorName: user.fullName || 'Admin',
    action: 'booking_payment_confirmed',
    entityType: 'CourseSubscription',
    entityId: subscriptionId,
    metadata: { subscriptionId }
  });

  revalidatePath('/creative-writing/booking/confirm');
  revalidatePath('/account/orders/creative-writing');
  revalidatePath('/dashboard/admin/bookings');
  
  return { success: true };
}
