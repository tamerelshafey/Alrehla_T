'use server';
import { requireAdmin } from '@/lib/auth-guard';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';
import { notifyUser, getInstructorUserId } from '@/lib/notifications';

/**
 * The session's meeting room and its time.
 *
 * The `meeting_url` column was added so the dashboards could stop linking
 * everybody to Google Meet's home page — but nothing could write to it, so
 * every session showed "رابط الجلسة لم يُضَف بعد" with no way to add one.
 */
/** يفوّض للقاعدة الموحّدة في `@/lib/auth-guard` — التنفيذ واحد، والرسالة خاصة بهذا المجال. */
async function requireBookingsAdmin() {
  return requireAdmin('canManageBookings', 'غير مصرح لك بإدارة الجلسات');
}

export async function updateSessionDetails(params: {
  sessionId: string;
  meetingUrl: string;
  scheduledAt: string;
}) {
  const admin = await requireBookingsAdmin();
  const { sessionId, meetingUrl, scheduledAt } = params;

  const url = meetingUrl.trim();
  if (url && !/^https?:\/\//i.test(url)) {
    throw new Error('الرابط لازم يبدأ بـ https://');
  }

  const when = new Date(scheduledAt);
  if (Number.isNaN(when.getTime())) throw new Error('الموعد غير صحيح');

  const supabase = await createClient();
  const { data: before } = await supabase
    .from('sessions')
    .select('scheduled_at, instructor_id, course_subscription_id')
    .eq('id', sessionId)
    .maybeSingle();

  const { error } = await supabase
    .from('sessions')
    .update({
      meeting_url: url || null,
      scheduled_at: when.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating session', error);
    throw new Error('تعذّر حفظ بيانات الجلسة');
  }

  const rescheduled = before && before.scheduled_at !== when.toISOString();

  // Both sides need to know — a moved session that nobody is told about is
  // a missed session.
  if (before?.instructor_id) {
    await notifyUser({
      event: 'session_update',
      recipientProfileId: await getInstructorUserId(before.instructor_id),
      title: rescheduled ? 'تم تعديل موعد جلسة' : 'تم تحديث رابط الجلسة',
      message: when.toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' }),
      link: `/dashboard/instructor/sessions/${sessionId}`,
    });
  }

  if (before?.course_subscription_id) {
    const { data: sub } = await supabase
      .from('course_subscriptions')
      .select('user_id')
      .eq('id', before.course_subscription_id)
      .maybeSingle();

    await notifyUser({
      event: 'session_update',
      recipientProfileId: sub?.user_id,
      title: rescheduled ? 'تم تعديل موعد جلستك' : 'تم تحديث رابط جلستك',
      message: when.toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' }),
      link: `/dashboard/student/sessions/${sessionId}`,
    });
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: rescheduled ? 'session_rescheduled' : 'session_updated',
    entityType: 'Session',
    entityId: sessionId,
    metadata: { meetingUrl: url || null, scheduledAt: when.toISOString() },
  });

  revalidatePath(`/dashboard/admin/sessions/${sessionId}`);
  revalidatePath(`/dashboard/instructor/sessions/${sessionId}`);
  revalidatePath(`/dashboard/student/sessions/${sessionId}`);
  revalidatePath('/dashboard/admin/bookings');
  return { ok: true };
}
