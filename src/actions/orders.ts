'use server';

import { mockOrders } from '@/data/mock';
import { revalidatePath } from 'next/cache';
import { OrderItem } from '@/types';

// Utility to create a dummy order for checkout simulation
export async function createDummyOrder(items: OrderItem[], totalAmount: number) {
  const newOrder = {
    id: `ord-${Date.now()}`,
    userId: 'current-user', // hardcoded for demo
    items,
    totalAmount,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  mockOrders.push(newOrder);
  return newOrder.id;
}

export async function submitPaymentProof(orderId: string, transactionReference: string) {
  const order = mockOrders.find(o => o.id === orderId);
  if (order) {
    order.status = 'awaiting_verification';
    order.transactionReference = transactionReference;
    
    revalidatePath('/enha-lak/checkout');
    revalidatePath('/account/orders/enha-lak');
    revalidatePath('/dashboard/admin/orders');
    return { success: true };
  }
  return { success: false, error: 'Order not found' };
}

export async function confirmOrderPayment(orderId: string) {
  const order = mockOrders.find(o => o.id === orderId);
  if (order) {
    order.status = 'paid';
    
    revalidatePath('/enha-lak/checkout');
    revalidatePath('/account/orders/enha-lak');
    revalidatePath('/dashboard/admin/orders');
    return { success: true };
  }
  return { success: false, error: 'Order not found' };
}
