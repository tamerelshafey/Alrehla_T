import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { AddonProduct } from '@/types';

export function Step3Addons({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { watch, setValue } = useFormContext();
  const selectedAddons: string[] = watch('selectedAddonIds') || [];
  
  // Mock addons data instead of fetching for now as there's no mock endpoint
  const [addons] = useState<AddonProduct[]>([
    { id: 'addon-1', name: 'لعبة دمية لبطل القصة', price: 150, description: 'لعبة قماشية صغيرة مصممة لتشبه بطل القصة.' },
    { id: 'addon-2', name: 'تغليف هدايا فاخر', price: 50, description: 'تغليف جميل ومميز للقصة لتكون جاهزة للإهداء.' },
    { id: 'addon-3', name: 'نسخة رقمية (PDF)', price: 100, description: 'نسخة عالية الدقة للقراءة على الأجهزة اللوحية.' }
  ]);

  const toggleAddon = (id: string) => {
    if (selectedAddons.includes(id)) {
      setValue('selectedAddonIds', selectedAddons.filter(a => a !== id));
    } else {
      setValue('selectedAddonIds', [...selectedAddons, id]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800">إضافات مميزة (اختياري)</h2>
      <p className="text-slate-600">اجعل هديتك أكثر تميزاً بإضافة بعض اللمسات الخاصة.</p>

      <div className="space-y-4 mt-6">
        {addons.map((addon) => {
          const isSelected = selectedAddons.includes(addon.id);
          return (
            <div 
              key={addon.id}
              onClick={() => toggleAddon(addon.id)}
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition-colors ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                {isSelected && (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{addon.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{addon.description}</p>
              </div>
              <div className="font-black text-emerald-600">
                +{addon.price} ج.م
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-xl bg-slate-100 px-8 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-200"
        >
          السابق
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition-colors hover:bg-blue-700"
        >
          الخطوة التالية
        </button>
      </div>
    </div>
  );
}
