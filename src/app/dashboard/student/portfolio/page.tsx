import { getCurrentUser, getPortfolioItems } from '@/data/mock';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, FileText, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (user.role !== 'student') {
    redirect('/dashboard');
  }

  const items = await getPortfolioItems();
  
  // Sort items by date descending
  const sortedItems = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/dashboard/student" className="inline-flex items-center gap-2 text-sm text-slate-500 font-bold hover:text-slate-800 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          العودة للوحة التحكم
        </Link>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-amber-500" />
          ملفي الكتابي
        </h1>
        <p className="text-slate-500 mt-2 font-medium">مساحة تجمع إبداعاتك ونصوصك خلال رحلتك معنا.</p>
      </div>

      <div className="space-y-6">
        {sortedItems.map((item) => (
          <article key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{item.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full">{item.packageName}</span>
                  <span className="bg-slate-100 px-3 py-1 rounded-full">الجلسة {item.sessionNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-sm font-medium whitespace-nowrap">
                <Calendar className="w-4 h-4" />
                {new Date(item.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <FileText className="w-6 h-6 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium leading-relaxed italic">
                "{item.excerpt}"
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                قراءة النص كاملاً
              </button>
            </div>
          </article>
        ))}

        {sortedItems.length === 0 && (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">لا توجد نصوص بعد</h3>
            <p className="text-slate-500 font-medium">لم تقم بإضافة أي نصوص إلى ملفك الكتابي حتى الآن.</p>
          </div>
        )}
      </div>
    </div>
  );
}
