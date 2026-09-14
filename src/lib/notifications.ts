import { createClient } from '@/lib/supabase/server';

/**
 * Sending an in-app notification.
 *
 * The `notifications` table existed from the beginning and nothing in the site
 * ever wrote to it — every approval, delivery and payment happened silently and
 * the person only found out by opening the right screen by chance.
 *
 * Writing goes through a guarded database function rather than a plain insert:
 * a direct insert policy would let any signed-in user send a notification to
 * anyone, which is an open door for spam.
 *
 * Notifications are never load-bearing. A failure is logged and swallowed so
 * that it can never turn a successful approval or delivery into an error.
 */
export async function notifyUser(params: {
  recipientProfileId: string | null | undefined;
  title: string;
  message?: string;
  link?: string;
}) {
  const { recipientProfileId, title, message, link } = params;
  if (!recipientProfileId || !title.trim()) return;

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('notify_user', {
      p_recipient: recipientProfileId,
      p_title: title,
      p_message: message ?? null,
      p_link: link ?? null,
    });
    if (error) console.error('Error sending notification', error);
  } catch (err) {
    console.error('Error sending notification', err);
  }
}

/** The user profile behind an instructor record, for notifying them. */
export async function getInstructorUserId(instructorId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('instructors')
    .select('user_id')
    .eq('id', instructorId)
    .maybeSingle();
  return data?.user_id ?? null;
}
