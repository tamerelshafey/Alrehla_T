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

export type PortfolioResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

async function writeDocument(
  documentId: string,
  title: string,
  content: string,
  status: 'draft' | 'submitted'
): Promise<PortfolioResult> {
  const supabase = await createClient();
  // العنوان كان بيتكتب في الشاشة ومبيتبعتش هنا خالص — فأي تعديل عليه
  // كان بيضيع عند الحفظ.
  const { data, error } = await supabase
    .from('portfolio_documents')
    .update({ title, content, status, updated_at: new Date().toISOString() })
    .eq('id', documentId)
    .select('id');

  if (error) {
    console.error('Error saving portfolio document', error);
    return { ok: false, error: `تعذّر حفظ النص: ${error.message}` };
  }
  if (!data || data.length === 0) {
    return { ok: false, error: 'الحفظ مروّحش للقاعدة — صلاحيات الحساب مش سامحة بالتعديل.' };
  }

  revalidatePath('/dashboard/student/portfolio');
  revalidatePath(`/dashboard/student/portfolio/${documentId}`);
  return { ok: true, id: documentId };
}

/**
 * نص جديد.
 *
 * الشاشة كانت بتفتح عادي على `portfolio/new`، بس زرار الحفظ كان بيخرج
 * من غير ما يعمل حاجة لما ما يكونش فيه نص محفوظ قبل كده — الطالب يكتب
 * صفحة كاملة ويدوس حفظ ومفيش أي حاجة بتحصل، ولا رسالة خطأ.
 */
export async function createPortfolioDocument(params: {
  title: string;
  content: string;
  status: 'draft' | 'submitted';
}): Promise<PortfolioResult> {
  const user = await getCurrentUser();
  if (user.role === 'visitor') {
    return { ok: false, error: 'يجب تسجيل الدخول أولاً' };
  }

  const title = params.title.trim();
  if (!title) return { ok: false, error: 'اكتب عنوان للنص' };
  if (!params.content.trim()) return { ok: false, error: 'النص فاضي' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('portfolio_documents')
    .insert({
      student_id: user.id,
      title,
      content: params.content,
      status: params.status,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Error creating portfolio document', error);
    return { ok: false, error: `تعذّر إنشاء النص: ${error?.message ?? ''}` };
  }

  revalidatePath('/dashboard/student/portfolio');
  return { ok: true, id: data.id };
}

export async function saveDocumentDraft(
  documentId: string,
  title: string,
  content: string
): Promise<PortfolioResult> {
  let document;
  try {
    ({ document } = await requireOwnDocument(documentId));
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'غير مصرح' };
  }
  if (document.status === 'reviewed') {
    return { ok: false, error: 'تمت مراجعة هذا النص ولا يمكن تعديله' };
  }
  return writeDocument(documentId, title, content, 'draft');
}

export async function submitDocumentForReview(
  documentId: string,
  title: string,
  content: string
): Promise<PortfolioResult> {
  let document;
  try {
    ({ document } = await requireOwnDocument(documentId));
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'غير مصرح' };
  }
  if (document.status === 'reviewed') {
    return { ok: false, error: 'تمت مراجعة هذا النص بالفعل' };
  }
  return writeDocument(documentId, title, content, 'submitted');
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
