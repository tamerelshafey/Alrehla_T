'use client';
import React, { useState } from 'react';
import { Instructor, DayOfWeek, WeeklySlot } from '@/types';
import { Calendar, Clock, Info, CheckCircle2, Save } from 'lucide-react';
import { calculateFinalSessionPrice } from '@/lib/utils';
import { mockInstructorPricingOptions, mockPricingFormulaSettings } from '@/data/domains/writing';
import { submitInstructorProfileUpdate } from '@/actions/instructors';

interface InstructorSettingsClientProps {
  instructor: Instructor;
}

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'saturday', label: 'السبت' },
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الإثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
  { key: 'friday', label: 'الجمعة' },
];

export function InstructorSettingsClient({ instructor }: InstructorSettingsClientProps) {
  const [workModel, setWorkModel] = useState(instructor.workModel || 'per_session');
  const [monthlyHours, setMonthlyHours] = useState(instructor.monthlyHoursCommitted || 60);
  const [requestedPrice, setRequestedPrice] = useState(instructor.requestedPrice || 100);
  const [selectedPricingOptionId, setSelectedPricingOptionId] = useState(instructor.selectedPricingOptionId || mockInstructorPricingOptions[0].id);
  const [schedule, setSchedule] = useState<WeeklySlot[]>(instructor.weeklySchedule || []);
  const [isSaved, setIsSaved] = useState(false);

  const toggleSlot = (day: DayOfWeek, time: string) => {
    const existingIndex = schedule.findIndex(s => s.day === day && s.time === time);
    if (existingIndex >= 0) {
      const newSchedule = [...schedule];
      newSchedule.splice(existingIndex, 1);
      setSchedule(newSchedule);
    } else {
      setSchedule([...schedule, { day, time, commitmentType: 'ongoing' }]);
    }
  };

  const updateSlotCommitment = (day: DayOfWeek, time: string, field: 'commitmentType' | 'commitmentMonths', value: string) => {
    const newSchedule = [...schedule];
    const index = newSchedule.findIndex(s => s.day === day && s.time === time);
    if (index >= 0) {
      if (field === 'commitmentType') {
        newSchedule[index].commitmentType = value as 'ongoing' | 'fixed_term';
        if (value === 'fixed_term' && !newSchedule[index].commitmentMonths) {
          newSchedule[index].commitmentMonths = 1;
        } else if (value === 'ongoing') {
          delete newSchedule[index].commitmentMonths;
          delete newSchedule[index].commitmentEndsAt;
        }
      } else if (field === 'commitmentMonths') {
        newSchedule[index].commitmentMonths = parseInt(value) || 1;
      }
      setSchedule(newSchedule);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitInstructorProfileUpdate(instructor.id, {
      workModel: workModel as any,
      monthlyHoursCommitted: workModel === 'monthly' ? monthlyHours : undefined,
      requestedPrice: workModel === 'monthly' ? Number(requestedPrice) : undefined,
      selectedPricingOptionId: workModel === 'per_session' ? selectedPricingOptionId : undefined,
      weeklySchedule: schedule
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const selectedPricingOption = mockInstructorPricingOptions.find(o => o.id === selectedPricingOptionId);
  const finalPrice = selectedPricingOption ? calculateFinalSessionPrice(selectedPricingOption.basePricePerSession, mockPricingFormulaSettings[0]) : 0;

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3 text-blue-800">
        <Info className="h-5 w-5 shrink-0" />
        <div className="text-sm">
          <p className="font-bold">مراجعة الإدارة</p>
          <p>أي تغييرات في خطة العمل، التسعير، أو الجدول تخضع لمراجعة وموافقة الإدارة. سيتم إخطارك بمجرد الاعتماد أو إذا كانت هناك ملاحظات.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 mb-4">نموذج العمل والتسعير</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">نظام العمل</label>
            <select 
              value={workModel} 
              onChange={(e) => setWorkModel(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-amber-500 focus:outline-none"
            >
              <option value="per_session">بالجلسة</option>
              <option value="monthly">راتب شهري (يتطلب 60 ساعة التزام على الأقل)</option>
            </select>
          </div>

          {workModel === 'monthly' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">عدد الساعات الملتزم بها شهرياً (الحد الأدنى 60)</label>
              <input 
                type="number" 
                min={60}
                value={monthlyHours}
                onChange={(e) => setMonthlyHours(parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-amber-500 focus:outline-none"
              />
              <label className="text-sm font-bold text-slate-700 mt-4 block">قيمة الراتب الشهري المقترح (ج.م)</label>
              <input 
                type="number" 
                value={requestedPrice}
                onChange={(e) => setRequestedPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          {workModel === 'per_session' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">فئة السعر</label>
              <select
                value={selectedPricingOptionId}
                onChange={(e) => setSelectedPricingOptionId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-amber-500 focus:outline-none"
              >
                {mockInstructorPricingOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label} ({option.basePricePerSession} ج.م كحصيلة للمدرب)
                  </option>
                ))}
              </select>
              {selectedPricingOption && (
                <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold">سعرك:</span> {selectedPricingOption.basePricePerSession} ج.م — <span className="font-bold">السعر الذي يظهر للعميل:</span> {finalPrice} ج.م
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-800">الجدول الأسبوعي المتاح</h3>
          <p className="text-sm text-slate-500">
            حدد أوقات فراغك خلال الأسبوع. عند حجز الطالب لموعد، سيكون هذا الموعد ثابتاً بشكل أسبوعي طوال فترة التدريب.
          </p>
        </div>
        <div className="space-y-4">
          {DAYS.map(day => (
            <div key={day.key} className="flex flex-col gap-4 rounded-xl border border-slate-100 p-4">
              <div className="w-32 font-bold text-slate-800">{day.label}</div>
              <div className="flex flex-wrap gap-2">
                {['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(time => {
                  const slot = schedule.find(s => s.day === day.key && s.time === time);
                  const isSelected = !!slot;
                  return (
                    <div key={time} className={`flex flex-col gap-2 rounded-lg p-2 ${isSelected ? 'bg-amber-50 border border-amber-200' : ''}`}>
                      <button
                        type="button"
                        onClick={() => toggleSlot(day.key, time)}
                        className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                          isSelected 
                            ? 'bg-amber-500 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {time} {isSelected && '(مُختار)'}
                      </button>
                      {isSelected && (
                        <div className="flex flex-col gap-1 mt-1">
                          <select
                            value={slot.commitmentType || 'ongoing'}
                            onChange={(e) => updateSlotCommitment(day.key, time, 'commitmentType', e.target.value)}
                            className="text-xs rounded border border-amber-200 bg-white py-1 px-2 text-amber-800 outline-none focus:border-amber-400"
                          >
                            <option value="ongoing">مستمر</option>
                            <option value="fixed_term">فترة محددة</option>
                          </select>
                          {slot.commitmentType === 'fixed_term' && (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                placeholder="الشهور"
                                value={slot.commitmentMonths || 1}
                                onChange={(e) => updateSlotCommitment(day.key, time, 'commitmentMonths', e.target.value)}
                                className="w-16 text-xs rounded border border-amber-200 bg-white py-1 px-2 text-amber-800 outline-none focus:border-amber-400"
                              />
                              <span className="text-xs text-amber-700">شهور</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {isSaved && (
          <div className="flex items-center gap-2 text-amber-600 font-bold">
            <CheckCircle2 className="h-5 w-5" />
            <span>تم إرسال الطلب للإدارة للمراجعة</span>
          </div>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 font-bold text-white transition-colors hover:bg-slate-800"
        >
          <Save className="h-5 w-5" />
          حفظ وإرسال للاعتماد
        </button>
      </div>
    </form>
  );
}
