'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * A customer asking for a support session.
 *
 * This used to push the request onto an in-memory array and return success, so
 * every enquiry a customer sent was silently lost: they were told it had been
 * received, and nobody ever saw it.
 */
export async function submitSupportSessionRequest(
  contactName: string,
  contactPhone: string,
  message: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('support_session_requests').insert({
    user_id: user?.id ?? null,
    contact_name: contactName,
    contact_phone: contactPhone,
    message,
    status: 'pending',
  });

  if (error) {
    console.error('Error submitting support session request', error);
    throw new Error('تعذّر إرسال الطلب، برجاء المحاولة مرة أخرى');
  }

  revalidatePath('/dashboard/admin/support/session-requests');
  revalidatePath('/account/support');
  return { success: true };
}
