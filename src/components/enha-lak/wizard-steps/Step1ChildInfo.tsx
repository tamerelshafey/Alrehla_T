import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FamilyMember } from '@/types';
import { fetchFamilyMembers } from '@/app/actions/family';

export function Step1ChildInfo({ onNext }: { onNext: () => void }) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    fetchFamilyMembers().then(setMembers);
  }, []);

  const familyMemberId = watch('familyMemberId');

  const handleSelectExisting = (id: string) => {
    setValue('familyMemberId', id);
    setValue('newChildName', '');
    setValue('newChildBirthDate', '');
    setValue('newChildGender', '');
    setShowNewForm(false);
  };

  const handleShowNew = () => {
    setValue('familyMemberId', '');
    setShowNewForm(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800">بيانات الطفل</h2>
      
      {errors.newChildName?.message && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">
          {errors.newChildName.message as string}
        </div>
      )}

      {members.length > 0 && (
        <div className="space-y-4">
          <p className="font-bold text-slate-700">اختر من العائلة:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {members.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectExisting(m.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-colors
                  ${familyMemberId === m.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="h-16 w-16 bg-slate-200 rounded-full mb-3 flex items-center justify-center text-2xl font-bold text-slate-500">
                  {m.fullName.charAt(0)}
                </div>
                <span className="font-bold text-slate-800">{m.fullName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleShowNew}
          className={`flex w-full items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed transition-colors
            ${showNewForm ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-300 text-slate-500 hover:border-slate-400 font-bold'}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة طفل جديد للملف العائلي
        </button>
      </div>

      {showNewForm && (
        <div className="grid gap-4 md:grid-cols-2 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">الاسم الأول</label>
            <input 
              type="text" 
              {...register('newChildName')}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="اسم الطفل..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">سنة الميلاد</label>
            <input 
              type="number" 
              {...register('newChildBirthDate')}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="2015"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">الجنس</label>
            <select 
              {...register('newChildGender')}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">اختر...</option>
              <option value="male">ولد</option>
              <option value="female">بنت</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-6">
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
