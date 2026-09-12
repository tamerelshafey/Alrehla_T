
'use server';

import { mockInstructorPayouts, mockPublisherPayouts, mockWithdrawalRequests } from '@/data/domains/admin';
import { logAuditAction } from '@/data/domains/admin';
import { getCurrentUser } from '@/data/domains/auth';

export async function markInstructorPayoutAsPaid(payoutId: string) {
  const user = await getCurrentUser();
  if (user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const payout = mockInstructorPayouts.find((p) => p.id === payoutId);
  if (!payout) throw new Error('Payout not found');

  payout.status = 'paid';

  await logAuditAction({
    actorName: user.fullName,
    actorProfileId: user.id,
    action: 'instructor_payout_marked_paid',
    entityType: 'instructor_payout',
    entityId: payoutId,
  });

  return payout;
}

export async function markPublisherPayoutAsPaid(payoutId: string) {
  const user = await getCurrentUser();
  if (user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const payout = mockPublisherPayouts.find((p) => p.id === payoutId);
  if (!payout) throw new Error('Payout not found');

  payout.status = 'paid';

  await logAuditAction({
    actorName: user.fullName,
    actorProfileId: user.id,
    action: 'publisher_payout_marked_paid',
    entityType: 'publisher_payout',
    entityId: payoutId,
  });

  return payout;
}

export async function submitWithdrawalRequest(instructorId: string, amount: number, method: string) {
  const user = await getCurrentUser();
  if (user.role !== 'instructor') {
    throw new Error('Unauthorized');
  }
  if (user.id !== instructorId) {
    throw new Error('Unauthorized');
  }

  const newRequest = {
    id: `wr-${Date.now()}`,
    instructorId,
    amount,
    method,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  mockWithdrawalRequests.push(newRequest);

  await logAuditAction({
    actorName: user.fullName,
    actorProfileId: user.id,
    action: 'instructor_withdrawal_requested',
    entityType: 'withdrawal_request',
    entityId: newRequest.id,
  });

  return newRequest;
}

import { mockPublisherPricingSettings } from '@/data/domains/admin';

export async function updatePublisherPricingSettings(multiplier: number, fixedFee: number) {
  const user = await getCurrentUser();
  if (user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const settings = mockPublisherPricingSettings[0];
  if (!settings) throw new Error('Settings not found');

  settings.platformMultiplier = multiplier;
  settings.fixedAdminFee = fixedFee;
  settings.updatedAt = new Date().toISOString();
  
  await logAuditAction({
    actorName: user.fullName,
    actorProfileId: user.id,
    action: 'publisher_pricing_settings_updated',
    entityType: 'settings',
    entityId: settings.id,
  });
  
  return settings;
}
