'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/data/domains/auth';
import { hasAdminPermission } from '@/lib/utils';
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
  const admin = await getCurrentUser();
  if (!hasAdminPermission(admin, 'canManageSupport')) {
    throw new Error('غير مصرح لك بإدارة طلبات الانضمام');
  }

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

  revalidatePath('/dashboard/admin/join-requests');
  revalidatePath('/dashboard/admin');
  return { success: true };
}
