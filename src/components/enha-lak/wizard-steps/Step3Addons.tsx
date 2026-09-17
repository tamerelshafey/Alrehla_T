import { formatPrice } from '@/lib/utils';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AddonProduct } from '@/types';

/**
 * الإضافات بتيجي من قاعدة البيانات (جدول `addon_products`) عن طريق
 * الصفحة، مش مكتوبة هنا. قبل كده كانت تلات إضافات بأسعار في كود
 * المتصفح، وبعدين قايمة فاضية ثابتة.
 */
export function Step3Addons({
  onNext,
  onPrev,
  addons,
}: {
  onNext: () => void;
  onPrev: () => void;
  addons: AddonProduct[];
}) {
  const { watch, setValue } = useFormContext();
  const selectedAddons: string[] = watch('selectedAddonIds') || [];

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
        {addons.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-500">
            مفيش إضافات متاحة حاليًا — كمّل عادي.
          </p>
        )}
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
                +{formatPrice(addon.price)}
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
