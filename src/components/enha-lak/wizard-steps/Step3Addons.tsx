import { formatPrice } from '@/lib/utils';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AddonProduct } from '@/types';

/**
 * الإضافات بتيجي من قاعدة البيانات (جدول `addon_products`) عن طريق
 * الصفحة، مش مكتوبة هنا. قبل كده كانت تلات إضافات بأسعار في كود
 * المتصفح، وبعدين قايمة فاضية ثابتة.
 *
 * ── التخصيص ────────────────────────────────────────────────
 *
 * إضافة ممكن تتطلب **بتخصيص أو بدونه**، ولكل حالة سعرها. والتخصيص
 * بياخد نفس بيانات الطفل المدخلة في الخطوة ١ — فمفيش حقول جديدة
 * يملاها العميل هنا، اختيار وبس.
 *
 * ⚠️ الأسعار المعروضة هنا للعرض فقط. `create_customer_order` بتقرا
 *    السعر و`customization_price` من الجدول وبترفض أي تخصيص لإضافة
 *    `supports_customization = false`. يعني تلاعب المتصفح مبيعدّيش.
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
  const customizedAddons: string[] = watch('customizedAddonIds') || [];

  const toggleAddon = (id: string) => {
    if (selectedAddons.includes(id)) {
      setValue('selectedAddonIds', selectedAddons.filter((a) => a !== id));
      // إلغاء الإضافة بيلغي تخصيصها كمان — عشان مايفضلش رقم معلّق
      // لإضافة مش مطلوبة أصلًا.
      setValue('customizedAddonIds', customizedAddons.filter((a) => a !== id));
    } else {
      setValue('selectedAddonIds', [...selectedAddons, id]);
    }
  };

  const setCustomized = (id: string, customized: boolean) => {
    setValue(
      'customizedAddonIds',
      customized
        ? [...customizedAddons.filter((a) => a !== id), id]
        : customizedAddons.filter((a) => a !== id),
    );
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
          const isCustomized = customizedAddons.includes(addon.id);
          const shownPrice =
            addon.price + (isCustomized ? addon.customizationPrice : 0);

          return (
            <div
              key={addon.id}
              className={`rounded-2xl border-2 transition-colors ${isSelected ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => toggleAddon(addon.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAddon(addon.id);
                  }
                }}
                className="flex cursor-pointer items-start gap-4 p-5"
              >
                <div
                  className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'}`}
                >
                  {isSelected && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{addon.name}</h3>
                  {addon.description && (
                    <p className="text-sm text-slate-600 mt-1">{addon.description}</p>
                  )}
                  {addon.supportsCustomization && !isSelected && (
                    <p className="mt-2 text-xs font-bold text-emerald-700">
                      تقبل التخصيص باسم الطفل
                    </p>
                  )}
                </div>
                <div className="font-black text-emerald-700">+{formatPrice(shownPrice)}</div>
              </div>

              {/* اختيار التخصيص بيظهر بعد الاختيار وبس — قبل كده مالوش معنى. */}
              {isSelected && addon.supportsCustomization && (
                <div
                  role="radiogroup"
                  aria-label={`تخصيص ${addon.name}`}
                  className="grid gap-3 border-t border-emerald-200 p-5 sm:grid-cols-2"
                >
                  {[
                    {
                      value: true,
                      title: 'بتخصيص',
                      note: `باسم الطفل وبياناته · +${formatPrice(addon.customizationPrice)}`,
                    },
                    { value: false, title: 'بدون تخصيص', note: 'الشكل الأساسي' },
                  ].map((choice) => {
                    const active = isCustomized === choice.value;
                    return (
                      <button
                        key={choice.title}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setCustomized(addon.id, choice.value)}
                        className={`rounded-xl border-2 p-4 text-start transition-colors ${active ? 'border-emerald-600 bg-white' : 'border-slate-200 bg-white/60 hover:border-slate-300'}`}
                      >
                        <span className="block font-bold text-slate-800">{choice.title}</span>
                        <span className="mt-1 block text-xs font-medium text-slate-600">
                          {choice.note}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
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
