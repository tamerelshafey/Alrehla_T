'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { getCurrentUser } from '@/data/mock';

export async function saveWritingPackage(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;
  const isNew = !id;
  
  const name = formData.get('name') as string;
  const ageGroup = formData.get('ageGroup') as 'under_12' | '12_plus';
  const price = Number(formData.get('price'));
  const durationText = formData.get('durationText') as string;
  const sessionsCount = Number(formData.get('sessionsCount'));
  const sessionDuration = formData.get('sessionDuration') as string || null;
  const targetAudience = formData.get('targetAudience') as string;
  const prerequisiteNote = formData.get('prerequisiteNote') as string || null;
  const prerequisitePackageId = formData.get('prerequisitePackageId') as string || null;
  const shortDescription = formData.get('shortDescription') as string;
  const fullDescription = formData.get('fullDescription') as string;
  const isActive = formData.get('isActive') === 'on';

  const slug = isNew ? `pkg-${Date.now()}` : formData.get('slug') as string || `pkg-${Date.now()}`;

  const dbPayload = {
    slug,
    name,
    age_group: ageGroup,
    price,
    duration_text: durationText,
    sessions_count: sessionsCount,
    session_duration: sessionDuration,
    target_audience: targetAudience,
    prerequisite_note: prerequisiteNote,
    prerequisite_package_id: prerequisitePackageId,
    short_description: shortDescription,
    full_description: fullDescription,
    is_active: isActive
  };

  let savedId = id;

  if (isNew) {
    const { data, error } = await supabase
      .from('creative_writing_packages')
      .insert([dbPayload])
      .select('id')
      .single();
      
    if (error) {
      console.error('Error inserting package:', error);
      throw new Error('Failed to create package');
    }
    savedId = data.id;
  } else {
    const { error } = await supabase
      .from('creative_writing_packages')
      .update(dbPayload)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating package:', error);
      throw new Error('Failed to update package');
    }
  }

  const currentUser = await getCurrentUser();
  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: isNew ? 'writing_package_created' : 'writing_package_updated',
    entityType: 'WritingPackage',
    entityId: savedId,
    metadata: { name }
  });

  revalidatePath('/dashboard/admin/writing/packages');
  revalidatePath('/creative-writing/packages');
}
