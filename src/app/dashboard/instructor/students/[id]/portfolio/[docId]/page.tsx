import { getCurrentUser, getDocumentById, getInstructorStudents } from '@/data/mock';
import { redirect } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { InstructorDocumentClient } from './InstructorDocumentClient';

export const dynamic = 'force-dynamic';

export default async function InstructorDocumentPage({ params }: { params: Promise<{ id: string, docId: string }> }) {
  const user = await getCurrentUser();
  if (user.role !== 'instructor') {
    redirect('/dashboard');
  }

  const { id: studentId, docId } = await params;
  
  const students = await getInstructorStudents();
  const student = students.find(s => s.id === studentId) || students[0];

  const document = await getDocumentById(docId);

  if (!document) {
    redirect(`/dashboard/instructor/students/${studentId}`);
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
      <DashboardPageHeader 
        title={`مراجعة نص: ${document.title}`} 
        backHref={`/dashboard/instructor/students/${studentId}`}
      />
      <InstructorDocumentClient document={document} studentName={student.name} />
    </div>
  );
}
