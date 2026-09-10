'use client';

import React, { useState, useEffect } from 'react';
import { Publisher, PricingFormulaSettings } from '@/types';
import { calculateFinalSessionPrice } from '@/lib/utils';
import { saveProduct } from '@/actions/products';

interface Props {
  publishers: Publisher[];
  pricingSettings: PricingFormulaSettings;
}

export function ProductFormClient({ publishers, pricingSettings }: Props) {
  const [ownerType, setOwnerType] = useState('platform');
  const [basePrice, setBasePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  // تحديث السعر النهائي عند تغيير المالك أو السعر الأساسي
  useEffect(() => {
    if (ownerType === 'publisher' && basePrice > 0) {
      setFinalPrice(calculateFinalSessionPrice(basePrice, pricingSettings));
    } else {
      setFinalPrice(basePrice);
    }
  }, [ownerType, basePrice, pricingSettings]);

  return (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">المالك</label>
          <select 
            name="ownerType" 
            value={ownerType}
            onChange={(e) => setOwnerType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none mb-4"
          >
            <option value="platform">المنصة</option>
            <option value="publisher">ناشر (شريك)</option>
          </select>
          
          {ownerType === 'publisher' && (
            <>
              <label className="block text-sm font-bold text-slate-700 mb-2">اختر الناشر</label>
              <select name="publisherId" required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none">
                <option value="">-- اختر الناشر --</option>
                {publishers.map(pub => (
                  <option key={pub.id} value={pub.id}>{pub.name}</option>
                ))}
              </select>
            </>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">السعر الأساسي (الورقي)</label>
            <div className="relative">
              <input 
                type="number" 
                name="price"
                min="0"
                required 
                value={basePrice || ''}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 focus:border-amber-500 focus:outline-none pl-12" 
              />
              <span className="absolute left-4 top-3 text-slate-400 font-bold">ج.م</span>
            </div>
            {ownerType === 'publisher' && (
              <p className="text-xs text-slate-500 mt-2">هذا هو السعر الذي يطلبه الناشر (أساس حساب مستحقاته).</p>
            )}
          </div>
          
          {ownerType === 'publisher' && basePrice > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">نسبة المنصة (× {pricingSettings.platformMultiplier}) + رسوم ثابتة ({pricingSettings.fixedAdminFee} ج):</span>
                <span className="font-bold text-blue-700">+{finalPrice - basePrice} ج.م</span>
              </div>
              <div className="flex justify-between font-black text-lg border-t border-blue-200 pt-2 mt-2">
                <span className="text-slate-800">السعر النهائي للعميل:</span>
                <span className="text-emerald-600">{finalPrice} ج.م</span>
              </div>
            </div>
          )}
        </div>
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
  );
}
