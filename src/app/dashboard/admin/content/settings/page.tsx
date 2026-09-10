import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser } from '@/data/mock';
import { getSiteSettings } from '@/data/domains/content';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { updateSiteSettings } from '@/actions/content';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageContent')) {
    return <Unauthorized />;
  }

  const settings = await getSiteSettings();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title="الإعدادات العامة للمنصة" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <form action={updateSiteSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">اسم الموقع</label>
              <input type="text" name="siteName" defaultValue={settings.siteName} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">بريد التواصل الرئيسي</label>
              <input type="email" name="contactEmail" defaultValue={settings.contactEmail} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">رابط فيسبوك</label>
              <input type="url" name="facebookUrl" defaultValue={settings.facebookUrl} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">رابط إنستجرام</label>
              <input type="url" name="instagramUrl" defaultValue={settings.instagramUrl} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button type="submit" className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-slate-800">
              حفظ الإعدادات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
