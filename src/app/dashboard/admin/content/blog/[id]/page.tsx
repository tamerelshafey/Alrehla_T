import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageContent')) {
    return <Unauthorized />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title="تعديل مقال" backHref="/dashboard/admin/content/blog" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">عنوان المقال</label>
            <input type="text" defaultValue="كيف تشجع طفلك على القراءة" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">المقتطف</label>
            <textarea defaultValue="نصائح هامة لتنمية مهارات القراءة لدى الأطفال في سن مبكرة..." rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">المحتوى</label>
            <textarea defaultValue="محتوى المقال التفصيلي يكتب هنا..." rows={10} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
          </div>
          
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isPublished" defaultChecked className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="isPublished" className="font-bold text-slate-700">مقال منشور (ظاهر للزوار)</label>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button type="button" className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-slate-800">
              حفظ المقال
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
