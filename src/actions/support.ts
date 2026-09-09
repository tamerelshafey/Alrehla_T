'use server'

import { SupportSessionRequest } from '@/types';
import { revalidatePath } from 'next/cache';

export async function submitSupportSessionRequest(
  contactName: string,
  contactPhone: string,
  message: string
) {
  const { mockSupportSessionRequests } = require('@/data/domains/admin');
  
  const newReq: SupportSessionRequest = {
    id: `ssr-${Date.now()}`,
    contactName,
    contactPhone,
    message,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  mockSupportSessionRequests.push(newReq);
  
  revalidatePath('/dashboard/admin/support/session-requests');
  return { success: true };
}
