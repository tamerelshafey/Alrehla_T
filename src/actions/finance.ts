'use server';

import { mockInstructorPayouts, mockPublisherPayouts, mockWithdrawalRequests } from '@/data/domains/admin';
import { logAuditAction } from '@/data/domains/admin';

export async function markInstructorPayoutAsPaid(payoutId: string, actorProfileId: string) {
  const payout = mockInstructorPayouts.find((p) => p.id === payoutId);
  if (!payout) throw new Error('Payout not found');
  payout.status = 'paid';

  await logAuditAction({
    actorProfileId,
    action: 'instructor_payout_marked_paid',
    entityType: 'instructor_payout',
    entityId: payoutId,
  });

  return payout;
}

export async function markPublisherPayoutAsPaid(payoutId: string, actorProfileId: string) {
  const payout = mockPublisherPayouts.find((p) => p.id === payoutId);
  if (!payout) throw new Error('Payout not found');
  payout.status = 'paid';

  await logAuditAction({
    actorProfileId,
    action: 'publisher_payout_marked_paid',
    entityType: 'publisher_payout',
    entityId: payoutId,
  });

  return payout;
}

export async function submitWithdrawalRequest(instructorId: string, amount: number, method: string) {
  const newRequest = {
    id: `wr-\${Date.now()}`,
    instructorId,
    amount,
    method,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  mockWithdrawalRequests.push(newRequest);

  await logAuditAction({
    actorProfileId: instructorId,
    action: 'instructor_withdrawal_requested',
    entityType: 'withdrawal_request',
    entityId: newRequest.id,
  });

  return newRequest;
}
