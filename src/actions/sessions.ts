'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getMyInstructorId } from '@/data/domains/services';

/**
 * The instructor's attendance record and report for a session.
 *
 * The screen used to show "تم حفظ الحضور والتقرير، وتم إرسال نسخة للإدارة
 * وللطالب في لوحة التحكم الخاصة به" while doing nothing at all: there was no
 * action, and no table to write to.
 */
export async function saveSessionReport(params: {
  sessionId: string;
  attendance: 'present' | 'absent';
  report: string;
}) {
  const { sessionId, attendance, report } = params;

  const instructorId = await getMyInstructorId();
  if (!instructorId) throw new Error('لم يتم ربط حسابك بملف مدرب');

  const supabase = await createClient();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, instructor_id')
    .eq('id', sessionId)
    .maybeSingle();

  if (!session) throw new Error('الجلسة غير موجودة');
  if (session.instructor_id !== instructorId) {
    throw new Error('هذه الجلسة ليست مسنَدة إليك');
  }

  const { error } = await supabase.from('session_reports').upsert(
    {
      session_id: sessionId,
      instructor_id: instructorId,
      attendance,
      report: report.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'session_id' }
  );

  if (error) {
    console.error('Error saving session report', error);
    throw new Error('تعذّر حفظ التقرير');
  }

  revalidatePath(`/dashboard/instructor/sessions/${sessionId}`);
  revalidatePath(`/dashboard/admin/sessions/${sessionId}`);
  return { ok: true };
}
