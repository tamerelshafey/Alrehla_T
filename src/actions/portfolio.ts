'use server';

import { mockDocuments } from '@/data/domains/writing';

export async function saveDocumentDraft(documentId: string, content: string) {
  const doc = mockDocuments.find((d: any) => d.id === documentId);
  if (!doc) throw new Error('Document not found');
  doc.content = content;
  doc.status = 'draft';
  doc.updatedAt = new Date().toISOString();
  return doc;
}

export async function submitDocumentForReview(documentId: string, content: string) {
  const doc = mockDocuments.find((d: any) => d.id === documentId);
  if (!doc) throw new Error('Document not found');
  doc.content = content;
  doc.status = 'submitted';
  doc.updatedAt = new Date().toISOString();
  return doc;
}

export async function submitInstructorFeedback(documentId: string, feedback: string) {
  const doc = mockDocuments.find((d: any) => d.id === documentId);
  if (!doc) throw new Error('Document not found');
  doc.instructorFeedback = feedback;
  doc.status = 'reviewed';
  doc.updatedAt = new Date().toISOString();
  return doc;
}
