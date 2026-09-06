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
  const sortedItems = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <div className="mb-8">
        <Link
          href="/dashboard/student"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للوحة التحكم
        </Link>
        <h1 className="flex items-center gap-3 text-3xl font-black text-slate-900">
          <BookOpen className="h-8 w-8 text-amber-500" />
          ملفي الكتابي
        </h1>
        <p className="mt-2 font-medium text-slate-500">
          مساحة تجمع إبداعاتك ونصوصك خلال رحلتك معنا.
        </p>
      </div>

      <div className="space-y-6">
        {sortedItems.map((item) => (
          <article
            key={item.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:p-8"
          >
            <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-slate-800">
                  {item.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                    {item.packageName}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    الجلسة {item.sessionNumber}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium whitespace-nowrap text-slate-400">
                <Calendar className="h-4 w-4" />
                {new Date(item.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <FileText className="mb-3 h-6 w-6 text-slate-300" />
              <p className="leading-relaxed font-medium text-slate-600 italic">
                "{item.excerpt}"
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="text-sm font-bold text-blue-600 transition-colors hover:text-blue-800">
                قراءة النص كاملاً
              </button>
            </div>
          </article>
        ))}

        {sortedItems.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="mb-2 text-xl font-bold text-slate-700">
              لا توجد نصوص بعد
            </h3>
            <p className="font-medium text-slate-500">
              لم تقم بإضافة أي نصوص إلى ملفك الكتابي حتى الآن.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
