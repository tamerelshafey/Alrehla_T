'use server';

import { mockProducts } from '@/data/domains/products';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { getCurrentUser } from '@/data/mock';
import { PersonalizedProduct } from '@/types';

export async function saveProduct(formData: FormData) {
  const id = formData.get('id') as string;
  const isNew = !id;
  
  const name = formData.get('name') as string;
  const category = formData.get('category') as 'book' | 'game' | 'accessory' | 'library' | 'custom' | 'subscription';
  const price = Number(formData.get('price'));
  const electronicPrice = formData.get('electronicPrice') ? Number(formData.get('electronicPrice')) : undefined;
  const shortDescription = formData.get('shortDescription') as string;
  const coverImageUrl = formData.get('coverImageUrl') as string || undefined;
  const publisherId = formData.get('publisherId') as string || undefined;
  const ownerType = formData.get('ownerType') as 'platform' | 'publisher';
  
  // Basic slug generation
  const slug = isNew ? `prod-${Date.now()}` : formData.get('slug') as string || `prod-${Date.now()}`;
  
  const productData: PersonalizedProduct = {
    id: isNew ? `prod-${Date.now()}` : id,
    slug,
    name,
    category: category as any,
    price,
    electronicPrice,
    shortDescription,
    coverImageUrl,
    publisherId,
    ownerType
  };

  if (isNew) {
    mockProducts.push(productData);
  } else {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockProducts[index] = productData;
    }
  }

  const currentUser = await getCurrentUser();
  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: isNew ? 'product_created' : 'product_updated',
    entityType: 'PersonalizedProduct',
    entityId: productData.id,
    metadata: { name: productData.name }
  });

  revalidatePath('/dashboard/admin/products');
  revalidatePath('/dashboard/publisher/products');
}
