'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';

export async function createDummyBookingServiceOrder(
  amount: number, 
  packageId: string, 
  instructorId: string, 
  participantType: 'self' | 'child' = 'self', 
  childId?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  if (participantType === 'child' && childId) {
    const { data: validChild, error: childError } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('user_profile_id', user.id)
      .eq('id', childId)
      .single();
      
    if (childError || !validChild) {
      throw new Error(`Invalid child ID: ${childId}. It does not belong to the current user.`);
    }
  }

  // Insert course subscription
  const { data: subscription, error: subError } = await supabase
    .from('course_subscriptions')
    .insert({
      package_id: packageId,
      user_id: user.id,
      participant_type: participantType,
      child_id: participantType === 'child' ? childId : null,
      status: 'pending'
    })
    .select('id')
    .single();

  if (subError || !subscription) {
    console.error('Error creating subscription:', subError);
    throw new Error('Failed to create subscription');
  }

  // Insert initial session
  const { error: sessionError } = await supabase
    .from('sessions')
    .insert({
      course_subscription_id: subscription.id,
      instructor_id: instructorId,
      session_number: 1,
      scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString(), // Dummy 3 days later
      status: 'scheduled'
    });

  if (sessionError) {
    console.error('Error creating session:', sessionError);
    // Don't throw, let the subscription stand
  }

  return subscription.id;
}

export async function submitBookingPaymentProof(subscriptionId: string, transactionReference: string) {
  const supabase = await createClient();
  
  // We don't have transactionReference on course_subscriptions in the types, but we'll just update status
  const { error } = await supabase
    .from('course_subscriptions')
    .update({ status: 'awaiting_verification' })
    .eq('id', subscriptionId);

  if (error) {
    console.error('Error submitting payment proof:', error);
    return { success: false, error: 'Failed' };
  }

  revalidatePath('/creative-writing/booking/confirm');
  revalidatePath('/account/orders/creative-writing');
  revalidatePath('/dashboard/admin/bookings');
  
  return { success: true };
}

export async function confirmBookingPayment(subscriptionId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('course_subscriptions')
    .update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', subscriptionId);

  if (error) {
    console.error('Error confirming payment:', error);
    return { success: false };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await logAuditAction({
      actorProfileId: user.id,
      actorName: user.user_metadata?.full_name || 'Admin',
      action: 'booking_payment_confirmed',
      entityType: 'CourseSubscription',
      entityId: subscriptionId,
      metadata: { subscriptionId }
    });
  }

  revalidatePath('/creative-writing/booking/confirm');
  revalidatePath('/account/orders/creative-writing');
  revalidatePath('/dashboard/admin/bookings');
  
  return { success: true };
}
