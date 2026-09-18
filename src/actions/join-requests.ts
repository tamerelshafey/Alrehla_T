'use server';
import { requireAdmin } from '@/lib/auth-guard';

import { revalidatePath } from 'next/cache';
import { notifyAdmins } from '@/lib/notifications';
import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';

/**
 * Deciding on an application to join as an instructor or publisher.
 *
 * The admin screen had "قبول الطلب" and "رفض الطلب" buttons with no handler at
 * all, so every application stayed `pending` for ever however many times an
 * admin clicked.
 */
export async function setJoinRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected'
) {
  const admin = await requireAdmin('canManageSupport', 'غير مصرح لك بإدارة طلبات الانضمام');

  const supabase = await createClient();
  const { error } = await supabase
    .from('join_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId);

  if (error) {
    console.error('Error updating join request', error);
    throw new Error('تعذّر تحديث حالة الطلب');
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: status === 'approved' ? 'join_request_approved' : 'join_request_rejected',
    entityType: 'JoinRequest',
    entityId: requestId,
  });

  revalidatePath(`/dashboard/admin/join-requests/${requestId}`);
  revalidatePath('/dashboard/admin/join-requests');
  revalidatePath('/dashboard/admin');
  return { success: true };
}

/**
 * Someone applying to join the platform.
 *
 * The public form was a `<form>` with no action whose submit was a
 * `type="button"`: every application — instructors, illustrators, authors —
 * vanished the moment the applicant clicked send.
 */
// عامّة عن قصد: أي زائر يقدم طلب انضمام. قاعدة البيانات بتفرض
// `status = 'pending'` في قاعدة «Anyone can apply to join»، فمحدش
// يقدر يقدّم طلبًا مقبولًا من البداية.
export async function submitJoinRequest(params: {
  applicantName: string;
  email: string;
  phone: string;
  requestedRole: string;
  portfolioUrl: string;
  message: string;
}) {
  const applicantName = params.applicantName.trim();
  const email = params.email.trim();

  if (!applicantName) throw new Error('اكتب اسمك');
  if (!email || !email.includes('@')) throw new Error('اكتب بريدًا إلكترونيًا صحيحًا');
  if (!params.requestedRole) throw new Error('اختر الدور المطلوب');

  const supabase = await createClient();
  const { error } = await supabase.from('join_requests').insert({
    applicant_name: applicantName,
    requested_role: params.requestedRole,
    email,
    phone: params.phone.trim() || null,
    portfolio_url: params.portfolioUrl.trim() || null,
    message: params.message.trim() || null,
    status: 'pending',
  });

  if (error) {
    console.error('Error submitting join request', error);
    throw new Error('تعذّر إرسال الطلب، برجاء المحاولة مرة أخرى');
  }

  await notifyAdmins({
    event: 'join_request',
    title: 'طلب انضمام جديد',
    message: `${applicantName} قدّم طلب انضمام.`,
    link: '/dashboard/admin/join-requests',
  });

  await notifyAdmins({
    event: 'join_request',
    title: 'طلب انضمام جديد',
    message: `${applicantName} قدّم طلب انضمام.`,
    link: '/dashboard/admin/join-requests',
  });

  revalidatePath('/dashboard/admin/join-requests');
  revalidatePath('/dashboard/admin');
  return { success: true };
}
