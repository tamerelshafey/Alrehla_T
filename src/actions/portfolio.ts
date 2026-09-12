
'use server';

import { mockDocuments } from '@/data/domains/writing';
import { getCurrentUser } from '@/data/domains/auth';

export async function saveDocumentDraft(documentId: string, content: string) {
  const user = await getCurrentUser();
  if (user.role === 'visitor') {
    throw new Error('Unauthorized');
  }

  const doc = mockDocuments.find((d: any) => d.id === documentId);
  if (!doc) throw new Error('Document not found');

  if (doc.studentId !== user.id) {
    throw new Error('Unauthorized');
  }

  doc.content = content;
  doc.status = 'draft';
  doc.updatedAt = new Date().toISOString();
  return doc;
}

export async function submitDocumentForReview(documentId: string, content: string) {
  const user = await getCurrentUser();
  if (user.role === 'visitor') {
    throw new Error('Unauthorized');
  }

  const doc = mockDocuments.find((d: any) => d.id === documentId);
  if (!doc) throw new Error('Document not found');

  if (doc.studentId !== user.id) {
    throw new Error('Unauthorized');
  }

  doc.content = content;
  doc.status = 'submitted';
  doc.updatedAt = new Date().toISOString();
  return doc;
}

export async function submitInstructorFeedback(documentId: string, feedback: string) {
  const user = await getCurrentUser();
  if (user.role !== 'instructor') {
    throw new Error('Unauthorized');
  }

  const doc = mockDocuments.find((d: any) => d.id === documentId);
  if (!doc) throw new Error('Document not found');

  // Currently, PortfolioDocument does not track which instructor is assigned to it,
  // so we can only verify the actor's role.
  doc.instructorFeedback = feedback;
  doc.status = 'reviewed';
  doc.updatedAt = new Date().toISOString();
  return doc;
}
