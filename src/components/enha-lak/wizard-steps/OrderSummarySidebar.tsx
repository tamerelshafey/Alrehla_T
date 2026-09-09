'use client';
import { formatPrice } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { PersonalizedProduct } from '@/types';
import Image from 'next/image';

// We just mock the addons for now, or we can fetch them. Let's hardcode a few prices or assume each addon is 150.
// In a real app we would import mockAddonProducts. For now, let's say an addon is 150 EGP.

export function OrderSummarySidebar({ product }: { product: PersonalizedProduct }) {
  const { watch } = useFormContext();
  const selectedAddonIds: string[] = watch('selectedAddonIds') || [];
  const facePhotoFile = watch('facePhotoFile');
  const familyMemberId = watch('familyMemberId');
  const newChildName = watch('newChildName');
  
  const [facePhotoPreviewUrl, setFacePhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!facePhotoFile) {
      setFacePhotoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(facePhotoFile);
    setFacePhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [facePhotoFile]);
  
  const childName = newChildName || (familyMemberId ? 'مشارك من العائلة' : null);

  // Calculate total
  let addonsTotal = 0;
  const addonsData = [
    { id: 'addon-1', price: 150 },
    { id: 'addon-2', price: 50 },
    { id: 'addon-3', price: 100 }
  ];
  selectedAddonIds.forEach(id => {
    const addon = addonsData.find(a => a.id === id);
    if (addon) addonsTotal += addon.price;
  });
  const total = product.price + addonsTotal;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
      <h3 className="text-xl font-black text-slate-800 mb-6">ملخص الطلب</h3>
      
      <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {product.coverImageUrl ? (
            <Image src={product.coverImageUrl} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
          ) : null}
        </div>
        <div>
          <h4 className="font-bold text-slate-800">{product.name}</h4>
          <p className="text-sm text-slate-500 mt-1">{formatPrice(product.price)}</p>
        </div>
      </div>

      {childName && (
        <div className="mb-6 pb-6 border-b border-slate-100">
          <h4 className="font-bold text-slate-700 text-sm mb-2">الطفل:</h4>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              {facePhotoPreviewUrl ? (
                 <Image src={facePhotoPreviewUrl} alt="صورة وجه الطفل للطلب" fill unoptimized className="object-cover" />
              ) : (
                <span className="text-xl text-slate-400 font-bold">{childName.charAt(0)}</span>
              )}
            </div>
            <span className="font-bold text-slate-800">{childName}</span>
          </div>
        </div>
      )}

      {selectedAddonIds.length > 0 && (
        <div className="mb-6 pb-6 border-b border-slate-100">
          <h4 className="font-bold text-slate-700 text-sm mb-2">الإضافات ({selectedAddonIds.length}):</h4>
          <div className="flex justify-between text-sm text-slate-600">
            <span>إضافات مخصصة</span>
            <span>+{formatPrice(addonsTotal)}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-lg font-black text-slate-800 mt-4">
        <span>الإجمالي:</span>
        <span className="text-rose-500">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
