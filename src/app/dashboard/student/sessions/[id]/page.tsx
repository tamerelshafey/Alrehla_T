import { getCurrentUser } from '@/data/mock';
import { redirect } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Video, Clock, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function StudentSessionPage() {
  const user = await getCurrentUser();
  if (user.role !== 'student') {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title={`موعد الجلسة`} 
        backHref="/dashboard/student"
      />
      
      <div className="space-y-8">
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
              <Video className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-indigo-900 mb-1">غرفة التدريب المرئية</h2>
              <div className="flex items-center gap-3 text-indigo-700 font-medium">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> اليوم، 16:00</span>
                <span>•</span>
                <span className="flex items-center gap-1"><User className="h-4 w-4" /> مع المدرب أحمد محمود</span>
              </div>
            </div>
          </div>
          
          <a 
            href="https://meet.google.com" 
            target="_blank" 
            rel="noreferrer"
            className="rounded-xl bg-indigo-600 px-8 py-4 font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95 text-center w-full md:w-auto"
          >
            دخول الجلسة
          </a>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3 text-blue-800">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-bold mb-1">تعليمات الجلسة</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>تأكد من استقرار اتصال الإنترنت قبل الدخول.</li>
              <li>جهز مسودتك أو ملف الكتابة لمشاركته مع المدرب.</li>
              <li>الجلسة تبدأ في موعدها المحدد، يُرجى الالتزام بالحضور.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
