'use server';

import { mockSiteSettings } from '@/data/domains/content';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { getCurrentUser } from '@/data/mock';

export async function updateSiteSettings(formData: FormData) {
  const siteName = formData.get('siteName') as string;
  const contactEmail = formData.get('contactEmail') as string;
  const facebookUrl = formData.get('facebookUrl') as string;
  const instagramUrl = formData.get('instagramUrl') as string;

  if (siteName) mockSiteSettings.siteName = siteName;
  if (contactEmail) mockSiteSettings.contactEmail = contactEmail;
  if (facebookUrl) mockSiteSettings.facebookUrl = facebookUrl;
  if (instagramUrl) mockSiteSettings.instagramUrl = instagramUrl;

  const currentUser = await getCurrentUser();
  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: 'site_settings_updated',
    entityType: 'SiteSettings',
    entityId: 'global',
    metadata: { siteName, contactEmail, facebookUrl, instagramUrl }
  });

  revalidatePath('/dashboard/admin/content/settings');
}
