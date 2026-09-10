'use server';

import { mockServiceOrders, mockBookings } from '@/data/mock';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { getCurrentUser } from '@/data/mock';

// Helper to simulate a booking checkout
export async function createDummyBookingServiceOrder(amount: number, packageId: string, instructorId: string) {
  const newOrder = {
    id: `so-${Date.now()}`,
    buyerProfileId: 'current-user',
    packageId: packageId,
    instructorId: instructorId,
    status: 'pending' as const,
    amount,
    createdAt: new Date().toISOString(),
  };
  mockServiceOrders.push(newOrder);
  
  // We also create a dummy booking linked to it if needed, or we just pretend 
  // the order ID is the booking ID for simplicity. Let's just create a booking
  // with the same ID so we can match them if needed, or pass the booking ID.
  const newBooking = {
    id: newOrder.id, // match IDs for simplicity in mock
    packageId, instructorId,
    status: 'pending' as const,
    scheduledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  mockBookings.push(newBooking);
  
  return newOrder.id; // Returns the ID used for both booking and service order
}

export async function submitBookingPaymentProof(bookingId: string, transactionReference: string) {
  const serviceOrder = mockServiceOrders.find(so => so.id === bookingId);
  const booking = mockBookings.find(b => b.id === bookingId);
  
  if (serviceOrder) {
    serviceOrder.status = 'awaiting_verification';
    serviceOrder.transactionReference = transactionReference;
  }
  
  if (booking) {
    booking.status = 'pending'; // Booking itself is pending until payment is paid? Or awaiting_verification? Booking status is separate. Let's stick to service order.
  }

  revalidatePath('/creative-writing/booking/confirm');
  revalidatePath('/account/orders/creative-writing');
  revalidatePath('/dashboard/admin/bookings');
  
  return { success: !!serviceOrder };
}

export async function confirmBookingPayment(bookingId: string) {
  const serviceOrder = mockServiceOrders.find(so => so.id === bookingId);
  const booking = mockBookings.find(b => b.id === bookingId);
  
  if (serviceOrder) {
    serviceOrder.status = 'paid';
  }
  if (booking) {
    booking.status = 'confirmed'; // Usually confirmed when paid
  }

  const currentUser = await getCurrentUser();
  await logAuditAction({
    actorProfileId: currentUser.id,
    actorName: currentUser.fullName,
    action: 'booking_payment_confirmed',
    entityType: 'ServiceOrder',
    entityId: bookingId,
    metadata: { bookingId }
  });

  revalidatePath('/creative-writing/booking/confirm');
  revalidatePath('/account/orders/creative-writing');
  revalidatePath('/dashboard/admin/bookings');
  
  return { success: !!serviceOrder };
}
