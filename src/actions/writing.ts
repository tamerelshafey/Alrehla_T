'use server';

import { mockWritingPackages } from '@/data/domains/writing';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { getCurrentUser } from '@/data/mock';
import { WritingPackage } from '@/types';

export async function saveWritingPackage(formData: FormData) {
  const id = formData.get('id') as string;
  const isNew = !id;
  
  const name = formData.get('name') as string;
  const ageGroup = formData.get('ageGroup') as 'under_12' | '12_plus';
  const price = Number(formData.get('price'));
  const durationText = formData.get('durationText') as string;
  const sessionsCount = Number(formData.get('sessionsCount'));
  const sessionDuration = formData.get('sessionDuration') as string;
  const targetAudience = formData.get('targetAudience') as string;
  const prerequisiteNote = formData.get('prerequisiteNote') as string;
  const shortDescription = formData.get('shortDescription') as string;
  const fullDescription = formData.get('fullDescription') as string;
  const isActive = formData.get('isActive') === 'on';

  // Basic slug generation from name for English/Arabic (not perfect but ok for mock)
  const slug = isNew ? `pkg-${Date.now()}` : formData.get('slug') as string || `pkg-${Date.now()}`;

  const packageData: WritingPackage = {
    id: isNew ? `pkg-${Date.now()}` : id,
    slug,
    name,
    ageGroup,
    price,
    durationText,
    sessionsCount,
    sessionDuration,
    targetAudience,
    prerequisiteNote,
    shortDescription,
    fullDescription,
    isActive
  };

  if (isNew) {
    mockWritingPackages.push(packageData);
  } else {
    const index = mockWritingPackages.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockWritingPackages[index] = packageData;
    }
  }

  const currentUser = await getCurrentUser();
  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: isNew ? 'writing_package_created' : 'writing_package_updated',
    entityType: 'WritingPackage',
    entityId: packageData.id,
    metadata: { name: packageData.name }
  });

  revalidatePath('/dashboard/admin/writing/packages');
  revalidatePath('/creative-writing/packages');
}
