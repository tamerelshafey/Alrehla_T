import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getPersonalizedProducts, getPublishers } from '@/data/mock';
import { hasAdminPermission , formatPrice } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManagePublishers')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const allProducts = await getPersonalizedProducts();
  const target = allProducts.find(p => p.id === id) || allProducts[0];
  const publishers = await getPublishers();
  
  const pub = target.publisherId ? publishers.find(p => p.id === target.publisherId) : null;
  const categoryDisplay = target.category === 'library' ? 'مكتبة' : target.category === 'custom' ? 'مخصص' : 'اشتراك';

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="تفاصيل المنتج" backHref="/dashboard/admin/products" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col md:flex-row gap-8">
        <div className="relative h-64 w-full md:w-64 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
          {target.coverImageUrl ? (
            <Image src={target.coverImageUrl} alt={target.name} fill className="object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">لا توجد صورة</div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-3xl font-black text-slate-800">{target.name}</h2>
            <button className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white transition-colors hover:bg-slate-800 self-start">
              تغيير ملكية المنتج
            </button>
          </div>
          
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">{categoryDisplay}</span>
            <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">{formatPrice(target.price)}</span>
            {pub ? (
              <span className="rounded-md bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">ناشر: {pub.name}</span>
            ) : (
              <span className="rounded-md bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">منتج المنصة</span>
            )}
          </div>
          
          <h3 className="font-bold text-slate-800 mb-2">الوصف:</h3>
          <p className="text-slate-600 leading-relaxed">{target.shortDescription}</p>
        </div>
      </div>
    </div>
  );
}
