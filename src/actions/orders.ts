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
    // Fallback if not logged in just for testing in mock UI
    const newOrder = {
      id: `ord-${Date.now()}`,
      userId: 'current-user',
      items,
      totalAmount,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    mockOrders.push(newOrder as any);
    return newOrder.id;
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
    // Fallback logic
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = 'awaiting_verification';
      order.transactionReference = transactionReference;
    } else {
      return { success: false, error: 'Order not found' };
    }
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
    // Fallback logic
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = 'paid';
    } else {
      return { success: false, error: 'Order not found' };
    }
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
