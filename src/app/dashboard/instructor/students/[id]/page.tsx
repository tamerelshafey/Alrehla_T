import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { getInstructorStudents, getSessions, getStudentDocuments } from '@/data/mock';
import { User, Calendar, FileText } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: studentId } = await params;
  
  // For the sake of this mock, we just get all students and find the first or mock one
  const students = await getInstructorStudents();
  const student = students.find(s => s.id === studentId) || students[0];
  
  // We mock the sessions list based on bookings
  const bookings = await getSessions();

  const sessions = bookings.map((b, index) => ({
    sessionNumber: `الجلسة ${index + 1}`,
    date: formatDate(b.createdAt),
    status: b.status === 'confirmed' ? (
      <StatusBadge type="success" label="مكتملة" />
    ) : (
      <StatusBadge type="warning" label="قادمة" />
    ),
    action: (
      <Link 
        href={`/dashboard/instructor/sessions/s-${index}`} 
        className="text-blue-600 font-bold hover:underline"
      >
        دخول مساحة الجلسة
      </Link>
    )
  }));

  
  const documents = await getStudentDocuments(studentId);
  const docsData = documents.map((doc: any) => ({
    title: doc.title,
    date: formatDate(doc.updatedAt),
    status: doc.status === 'reviewed' ? (
      <StatusBadge type="success" label="تمت المراجعة" />
    ) : doc.status === 'submitted' ? (
      <StatusBadge type="warning" label="بانتظار مراجعتك" />
    ) : (
      <StatusBadge type="neutral" label="مسودة" />
    ),
    action: (
      <Link 
        href={`/dashboard/instructor/students/${studentId}/portfolio/${doc.id}`}
        className="text-blue-600 font-bold hover:underline"
      >
        عرض ومراجعة
      </Link>
    )
  }));

  const docsColumns = [
    { header: 'عنوان النص', accessorKey: 'title' },
    { header: 'آخر تحديث', accessorKey: 'date' },
    { header: 'الحالة', accessorKey: 'status' },
    { header: 'الإجراء', accessorKey: 'action' }
  ];

  const columns = [
    { header: 'الجلسة', accessorKey: 'sessionNumber' },
    { header: 'التاريخ', accessorKey: 'date' },
    { header: 'الحالة', accessorKey: 'status' },
    { header: 'مساحة العمل', accessorKey: 'action' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title={`ملف المتدرب: ${student.name}`} 
        backHref="/dashboard/instructor/students"
      />
      
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50 text-slate-300">
          <User className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">{student.name}</h2>
          <p className="text-slate-500 font-medium mb-3">{student.packageName}</p>
          <div className="flex gap-4">
            <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              التقدم: {student.sessionsCompleted} من {student.totalSessions}
            </span>
          </div>
        </div>
      </div>

      
      <div className="mb-8">
        <h3 className="mb-4 text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          الملف الكتابي للطالب (النصوص والمشاريع)
        </h3>
        {docsData.length > 0 ? (
          <SimpleDataTable columns={docsColumns} data={docsData} />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-8 text-center text-slate-500">
            لم يقم الطالب بكتابة أي نصوص بعد.
          </div>
        )}
      </div>

      <h3 className="mb-4 text-xl font-bold text-slate-800 flex items-center gap-2">

        <Calendar className="h-5 w-5 text-amber-500" />
        سجل الجلسات
      </h3>
      <SimpleDataTable columns={columns} data={sessions} />
    </div>
  );
}
