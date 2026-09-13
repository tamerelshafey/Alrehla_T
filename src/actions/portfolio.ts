'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/data/domains/auth';

/**
 * The student's writing portfolio: saving a draft, sending it for review, and
 * the instructor's feedback.
 *
 * All three used to edit an in-memory array, so a student could write for an
 * hour, see "تم الحفظ", and lose everything on the next restart. They now write
 * to `portfolio_documents`.
 */

/** The document must belong to the signed-in student. */
async function requireOwnDocument(documentId: string) {
  const user = await getCurrentUser();
  if (user.role === 'visitor') {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('portfolio_documents')
    .select('id, student_id, status')
    .eq('id', documentId)
    .maybeSingle();

  if (!data) throw new Error('النص غير موجود');
  if (data.student_id !== user.id) throw new Error('غير مصرح لك بتعديل هذا النص');
  return { user, document: data };
}

async function writeDocument(
  documentId: string,
  content: string,
  status: 'draft' | 'submitted'
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('portfolio_documents')
    .update({ content, status, updated_at: new Date().toISOString() })
    .eq('id', documentId);

  if (error) {
    console.error('Error saving portfolio document', error);
    throw new Error('تعذّر حفظ النص');
  }

  revalidatePath('/dashboard/student/portfolio');
  revalidatePath(`/dashboard/student/portfolio/${documentId}`);
  return { success: true };
}

export async function saveDocumentDraft(documentId: string, content: string) {
  const { document } = await requireOwnDocument(documentId);
  if (document.status === 'reviewed') {
    throw new Error('تمت مراجعة هذا النص ولا يمكن تعديله');
  }
  return writeDocument(documentId, content, 'draft');
}

export async function submitDocumentForReview(documentId: string, content: string) {
  const { document } = await requireOwnDocument(documentId);
  if (document.status === 'reviewed') {
    throw new Error('تمت مراجعة هذا النص بالفعل');
  }
  return writeDocument(documentId, content, 'submitted');
}

export async function submitInstructorFeedback(documentId: string, feedback: string) {
  const user = await getCurrentUser();
  if (user.role !== 'instructor') {
    throw new Error('غير مصرح لك بكتابة ملاحظات');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('portfolio_documents')
    .update({
      instructor_feedback: feedback,
      status: 'reviewed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)
    .select('id, student_id')
    .single();

  if (error || !data) {
    console.error('Error saving instructor feedback', error);
    throw new Error('تعذّر حفظ الملاحظات');
  }

  revalidatePath(`/dashboard/instructor/students/${data.student_id}/portfolio/${documentId}`);
  revalidatePath('/dashboard/student/portfolio');
  revalidatePath(`/dashboard/student/portfolio/${documentId}`);
  return { success: true };
}
