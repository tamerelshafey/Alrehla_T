import React from 'react';
import { useFormContext } from 'react-hook-form';

export function Step4Shipping({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800">معلومات الشحن</h2>
      <p className="text-slate-600">أين نرسل هذه الهدية المميزة؟</p>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">الاسم بالكامل</label>
          <input 
            type="text" 
            {...register('shippingName')}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="اسم المستلم"
          />
          {errors.shippingName && <span className="text-sm text-red-500">{errors.shippingName.message as string}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
          <input 
            type="tel" 
            {...register('shippingPhone')}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="01xxxxxxxxx"
          />
          {errors.shippingPhone && <span className="text-sm text-red-500">{errors.shippingPhone.message as string}</span>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">العنوان بالتفصيل</label>
          <input 
            type="text" 
            {...register('shippingAddress')}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="الشارع، المبنى، رقم الشقة"
          />
          {errors.shippingAddress && <span className="text-sm text-red-500">{errors.shippingAddress.message as string}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">المدينة</label>
          <input 
            type="text" 
            {...register('shippingCity')}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="القاهرة، الإسكندرية..."
          />
          {errors.shippingCity && <span className="text-sm text-red-500">{errors.shippingCity.message as string}</span>}
        </div>
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
