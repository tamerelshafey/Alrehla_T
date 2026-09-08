'use client';

import React from 'react';
import { User } from 'lucide-react';

interface ProfileFormShellProps {
  defaultValues?: {
    name?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
  };
}

export function ProfileFormShell({ defaultValues }: ProfileFormShellProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50 shadow-sm">
            {defaultValues?.avatarUrl ? (
              <img src={defaultValues.avatarUrl} alt="صورة الملف الشخصي" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-slate-300" />
            )}
          </div>
          <div className="text-center sm:text-right pt-2">
            <h3 className="text-lg font-bold text-slate-800">الصورة الشخصية</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">يُفضل استخدام صورة مربعة واضحة.</p>
            <div className="mt-4 flex gap-2 justify-center sm:justify-start">
              <button type="button" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
                تغيير الصورة
              </button>
              <button type="button" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50">
                حذف
              </button>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Form Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
            <input 
              type="text" 
              defaultValue={defaultValues?.name || ''} 
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 font-medium outline-none transition-colors focus:border-amber-500 focus:bg-white" 
              placeholder="الاسم"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
            <input 
              type="email" 
              defaultValue={defaultValues?.email || ''} 
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 font-medium text-left outline-none transition-colors focus:border-amber-500 focus:bg-white" 
              placeholder="email@example.com"
              dir="ltr"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-slate-700">نبذة عنك (Bio) / الوصف</label>
            <textarea 
              rows={5} 
              defaultValue={defaultValues?.bio || ''} 
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 font-medium outline-none transition-colors focus:border-amber-500 focus:bg-white" 
              placeholder="اكتب نبذة مختصرة هنا..."
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-slate-800"
          >
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
}
