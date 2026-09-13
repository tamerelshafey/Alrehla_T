'use server';

import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/data/domains/auth';
import { hasAdminPermission } from '@/lib/utils';

/**
 * Site-wide settings (contact email, social links).
 *
 * This used to assign onto an in-memory object, so an admin could change the
 * contact email, see it saved, and find it reverted after the next restart.
 * It now updates the single `site_settings` row the footer reads.
 */
export async function updateSiteSettings(formData: FormData) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageContent')) {
    throw new Error('غير مصرح لك بتعديل إعدادات الموقع');
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'general')
    .single();

  const current = (existing?.value ?? {}) as Record<string, unknown>;

  // Only overwrite a field the form actually supplied, so a partial save
  // cannot blank out settings it did not include.
  const next: Record<string, unknown> = { ...current };
  for (const field of ['siteName', 'contactEmail', 'facebookUrl', 'instagramUrl']) {
    const value = formData.get(field);
    if (typeof value === 'string' && value.trim() !== '') {
      next[field] = value.trim();
    }
  }

  const { error } = await supabase
    .from('site_settings')
    .update({ value: next as never })
    .eq('key', 'general');

  if (error) {
    console.error('Error updating site settings', error);
    throw new Error('تعذّر حفظ الإعدادات');
  }

  await logAuditAction({
    actorProfileId: user.id,
    actorName: user.fullName,
    action: 'site_settings_updated',
    entityType: 'SiteSettings',
    entityId: 'general',
    metadata: next,
  });

  revalidatePath('/dashboard/admin/content/settings');
  revalidatePath('/', 'layout');
}
