'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { getCurrentUser } from '@/data/mock';

export async function saveProduct(formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get('id') as string;
  const isNew = !id;
  
  const name = formData.get('name') as string;
  const category = formData.get('category') as 'library' | 'custom' | 'subscription';
  const price = Number(formData.get('price'));
  const electronicPrice = formData.get('electronicPrice') ? Number(formData.get('electronicPrice')) : null;
  const shortDescription = formData.get('shortDescription') as string;
  const coverImageUrl = formData.get('coverImageUrl') as string || null;
  const publisherId = formData.get('publisherId') as string || null;
  const ownerType = formData.get('ownerType') as 'platform' | 'publisher';
  
  // Basic slug generation
  const slug = isNew ? `prod-${Date.now()}` : formData.get('slug') as string || `prod-${Date.now()}`;
  
  const dbPayload = {
    slug,
    name,
    category,
    price,
    electronic_price: electronicPrice,
    short_description: shortDescription,
    cover_image_url: coverImageUrl,
    publisher_id: publisherId,
    owner_type: ownerType,
  };

  let savedId = id;

  if (isNew) {
    const { data, error } = await supabase
      .from('personalized_products')
      .insert([dbPayload])
      .select('id')
      .single();
      
    if (error) {
      console.error('Error inserting product:', error);
      throw new Error('Failed to create product');
    }
    savedId = data.id;
  } else {
    const { error } = await supabase
      .from('personalized_products')
      .update(dbPayload)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  const currentUser = await getCurrentUser();
  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: isNew ? 'product_created' : 'product_updated',
    entityType: 'PersonalizedProduct',
    entityId: savedId,
    metadata: { name }
  });

  revalidatePath('/dashboard/admin/products');
  revalidatePath('/dashboard/publisher/products');
  revalidatePath('/enha-lak/library');
  revalidatePath('/enha-lak/custom');
}
