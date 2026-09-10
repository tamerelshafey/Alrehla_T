import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getPublishers, getPersonalizedProducts } from '@/data/mock';
import { saveProduct } from '@/actions/products';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const publishers = await getPublishers();
  const myPublisher = publishers[0]; 

  const allProducts = await getPersonalizedProducts();
  const target = allProducts.find(p => p.id === id) || allProducts[0];

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title="تعديل المنتج" backHref="/dashboard/publisher/products" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <form action={saveProduct} className="space-y-6">
          <input type="hidden" name="id" value={target.id} />
          <input type="hidden" name="slug" value={target.slug} />
          <input type="hidden" name="ownerType" value="publisher" />
          <input type="hidden" name="publisherId" value={myPublisher.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">اسم المنتج</label>
              <input type="text" name="name" defaultValue={target.name} required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">النوع / التصنيف</label>
              <select name="category" defaultValue={target.category} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none">
                <option value="library">مكتبة</option>
                <option value="book">كتاب</option>
                <option value="game">لعبة</option>
                <option value="accessory">ملحق</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">السعر الورقي (ج.م)</label>
              <input type="number" name="price" defaultValue={target.price} required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">السعر الإلكتروني (اختياري)</label>
              <input type="number" name="electronicPrice" defaultValue={target.electronicPrice || ''} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الوصف</label>
            <textarea name="shortDescription" defaultValue={target.shortDescription} rows={3} required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none"></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">رابط صورة الغلاف (اختياري)</label>
            <input type="text" name="coverImageUrl" defaultValue={target.coverImageUrl || ''} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none text-left" dir="ltr" />
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button type="submit" className="rounded-xl bg-amber-500 px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-amber-600">
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
