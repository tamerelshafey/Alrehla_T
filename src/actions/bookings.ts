
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { getCurrentUser } from '@/data/domains/auth';

export type BookingResult =
  | { ok: true; subscriptionId: string }
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

  revalidatePath('/account/orders/creative-writing');
  revalidatePath('/dashboard/admin/bookings');
  return { ok: true, subscriptionId: data as unknown as string };
}

export async function submitBookingPaymentProof(subscriptionId: string, transactionReference: string) {
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
  
  // رقم التحويل كان بيترمي هنا: الحالة بتتغيّر والرقم بيضيع، فالإدارة
  // بتأكد دفع من غير مرجع. العمود اتضاف في ملف 46.
  const { error } = await supabase
    .from('course_subscriptions')
    .update({
      status: 'awaiting_verification',
      transaction_reference: transactionReference.trim(),
    })
    .eq('id', subscriptionId);

  if (error) {
    console.error('Error submitting payment proof:', error);
    return { success: false, error: 'Failed' };
  }

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
