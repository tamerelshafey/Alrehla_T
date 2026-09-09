'use server'

import { ProfileUpdateRequest, BillingModel, WeeklySlot, WorkModel, Instructor } from '@/types';
import { mockProfileUpdateRequests } from '@/data/domains/writing';
import { mockInstructors, mockInstructorCertifications } from '@/data/mock';
import { revalidatePath } from 'next/cache';

export async function submitInstructorProfileUpdate(
  instructorId: string,
  changes: Partial<Instructor>
) {
  const newRequest: ProfileUpdateRequest = {
    id: `req-${Date.now()}`,
    instructorId,
    requestedChanges: changes,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  mockProfileUpdateRequests.push(newRequest);
  revalidatePath(`/dashboard/instructor/settings`);
  revalidatePath(`/dashboard/admin/instructors/${instructorId}`);
  return { success: true };
}

export async function approveProfileUpdateRequest(requestId: string) {
  const req = mockProfileUpdateRequests.find(r => r.id === requestId);
  if (!req) throw new Error('Request not found');

  const instructor = mockInstructors.find(i => i.id === req.instructorId);
  if (!instructor) throw new Error('Instructor not found');

  // Apply changes
  if (req.requestedChanges.workModel) instructor.workModel = req.requestedChanges.workModel;
  if (req.requestedChanges.monthlyHoursCommitted !== undefined) instructor.monthlyHoursCommitted = req.requestedChanges.monthlyHoursCommitted;
  if (req.requestedChanges.requestedPrice) {
    instructor.requestedPrice = req.requestedChanges.requestedPrice;
    instructor.approvedPrice = req.requestedChanges.requestedPrice;
  }
  if (req.requestedChanges.selectedPricingOptionId) {
    instructor.selectedPricingOptionId = req.requestedChanges.selectedPricingOptionId;
    // Mock deriving approved price:
    const { mockInstructorPricingOptions } = require('@/data/domains/writing');
    const option = mockInstructorPricingOptions.find((o: any) => o.id === req.requestedChanges.selectedPricingOptionId);
    if (option) instructor.approvedPrice = option.basePricePerSession;
  }
  if (req.requestedChanges.weeklySchedule) instructor.weeklySchedule = req.requestedChanges.weeklySchedule;
  
  req.status = 'approved';
  
  revalidatePath(`/dashboard/admin/instructors/${req.instructorId}`);
  revalidatePath(`/dashboard/instructor/settings`);
  return { success: true };
}

export async function rejectProfileUpdateRequest(requestId: string, adminFeedback: string) {
  const req = mockProfileUpdateRequests.find(r => r.id === requestId);
  if (!req) throw new Error('Request not found');

  req.status = 'rejected';
  req.adminFeedback = adminFeedback;
  
  revalidatePath(`/dashboard/admin/instructors/${req.instructorId}`);
  revalidatePath(`/dashboard/instructor/settings`);
  return { success: true };
}

export async function updateInstructorCertification(instructorId: string, passed: boolean) {
  let cert = mockInstructorCertifications.find(c => c.instructorId === instructorId);
  if (!cert) {
    cert = {
      id: `cert-${Date.now()}`,
      instructorId,
      examPassed: passed,
    };
    mockInstructorCertifications.push(cert);
  } else {
    cert.examPassed = passed;
  }
  
  if (passed) {
    cert.certifiedAt = new Date().toISOString();
  } else {
    cert.certifiedAt = undefined;
  }
  
  revalidatePath(`/dashboard/admin/instructors/${instructorId}`);
  return { success: true };
}
