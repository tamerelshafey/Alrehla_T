import { getCurrentUser, getDocumentById } from '@/data/mock';
import { redirect } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { DocumentEditorClient } from './DocumentEditorClient';

export const dynamic = 'force-dynamic';

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (user.role !== 'student') {
    redirect('/dashboard');
  }

  const { id } = await params;
  
  // If id is 'new', we pass a null document
  const document = id === 'new' ? null : (await getDocumentById(id) || null);

  if (id !== 'new' && !document) {
    redirect('/dashboard/student/portfolio');
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
      <DashboardPageHeader 
        title={document ? 'تعديل النص' : 'نص جديد'} 
        backHref="/dashboard/student/portfolio"
      />
      <DocumentEditorClient initialDocument={document} />
    </div>
  );
}
