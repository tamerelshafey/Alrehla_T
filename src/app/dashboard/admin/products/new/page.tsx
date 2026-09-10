import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getPersonalizedProducts, getPublishers } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { saveProduct } from '@/actions/products';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManagePublishers')) {
    return <Unauthorized />;
  }

  const publishers = await getPublishers();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title="إضافة منتج جديد" backHref="/dashboard/admin/products" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <form action={saveProduct} className="space-y-6">
          <input type="hidden" name="id" value="" />
          <input type="hidden" name="slug" value="" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">اسم المنتج</label>
              <input type="text" name="name" required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">النوع / التصنيف</label>
              <select name="category" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none">
                <option value="library">مكتبة</option>
                <option value="custom">مخصص (إنها لك)</option>
                <option value="subscription">اشتراك</option>
                <option value="book">كتاب</option>
                <option value="game">لعبة</option>
                <option value="accessory">ملحق</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">السعر الورقي (ج.م)</label>
              <input type="number" name="price" required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">السعر الإلكتروني (اختياري)</label>
              <input type="number" name="electronicPrice" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">المالك</label>
            <select name="ownerType" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none mb-4">
              <option value="platform">المنصة</option>
              <option value="publisher">ناشر</option>
            </select>
            
            <label className="block text-sm font-bold text-slate-700 mb-2">الناشر (في حال كان المالك ناشر)</label>
            <select name="publisherId" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none">
              <option value="">-- بدون ناشر --</option>
              {publishers.map(pub => (
                <option key={pub.id} value={pub.id}>{pub.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الوصف</label>
            <textarea name="shortDescription" rows={3} required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none"></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">رابط صورة الغلاف (اختياري)</label>
            <input type="text" name="coverImageUrl" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none text-left" dir="ltr" />
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button type="submit" className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-slate-800">
              إضافة المنتج
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
