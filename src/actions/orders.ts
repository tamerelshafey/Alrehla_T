'use server';

import { mockOrders } from '@/data/mock';
import { revalidatePath } from 'next/cache';
import { OrderItem } from '@/types';
import { logAuditAction } from '@/lib/audit';
import { getCurrentUser } from '@/data/mock';

import { createClient } from '@/lib/supabase/server';

// Utility to create a dummy order for checkout simulation
export async function createDummyOrder(items: OrderItem[], totalAmount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      status: 'pending'
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Error creating order:', orderError);
    throw new Error('Failed to create order');
  }

  // Validate childIds if recipientType is child
  const childIds = items
    .filter(i => i.customizationData?.recipientType === 'child' && i.customizationData?.childId)
    .map(i => i.customizationData!.childId!);
    
  if (childIds.length > 0) {
    const { data: validChildren } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('user_profile_id', user.id)
      .in('id', childIds);
      
    const validChildIds = new Set(validChildren?.map(c => c.id) || []);
    for (const childId of childIds) {
      if (!validChildIds.has(childId)) {
        throw new Error(`Invalid child ID: ${childId}. It does not belong to the current user.`);
      }
    }
  }

  const orderItemsPayload = items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    customization_data: item.customizationData as any
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw new Error('Failed to add order items');
  }

  return order.id;
}

export async function submitPaymentProof(orderId: string, transactionReference: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'awaiting_verification',
      transaction_reference: transactionReference 
    })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating payment proof:', error);
    return { success: false, error: 'Order not found or update failed' };
  }

  revalidatePath('/enha-lak/checkout');
  revalidatePath('/account/orders/enha-lak');
  revalidatePath('/dashboard/admin/orders');
  return { success: true };
}

export async function confirmOrderPayment(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', orderId);

  if (error) {
    console.error('Error confirming payment:', error);
    return { success: false, error: 'Order not found or update failed' };
  }

  const currentUser = await getCurrentUser();
  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: 'order_payment_confirmed',
    entityType: 'Order',
    entityId: orderId,
    metadata: { orderId }
  });

  revalidatePath('/enha-lak/checkout');
  revalidatePath('/account/orders/enha-lak');
  revalidatePath('/dashboard/admin/orders');
  return { success: true };
}
