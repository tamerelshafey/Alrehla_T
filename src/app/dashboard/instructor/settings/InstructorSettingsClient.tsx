'use client';
import React, { useState } from 'react';
import { Instructor, DayOfWeek, WeeklySlot } from '@/types';
import { Calendar, Clock, Info, CheckCircle2, Save } from 'lucide-react';

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
  const [schedule, setSchedule] = useState<WeeklySlot[]>(instructor.weeklySchedule || []);
  const [isSaved, setIsSaved] = useState(false);

  const toggleSlot = (day: DayOfWeek, time: string) => {
    const existingIndex = schedule.findIndex(s => s.day === day && s.time === time);
    if (existingIndex >= 0) {
      const newSchedule = [...schedule];
      newSchedule.splice(existingIndex, 1);
      setSchedule(newSchedule);
    } else {
      setSchedule([...schedule, { day, time }]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call to submit profile update request to admin
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Alert about approvals */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3 text-blue-800">
        <Info className="h-5 w-5 shrink-0" />
        <div className="text-sm">
          <p className="font-bold">مراجعة الإدارة</p>
          <p>أي تغييرات في خطة العمل، التسعير، أو الجدول تخضع لمراجعة وموافقة الإدارة. سيتم إخطارك بمجرد الاعتماد أو إذا كانت هناك ملاحظات.</p>
        </div>
      </div>

      {/* Work Model & Pricing */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 mb-4">نموذج العمل والتسعير</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">نظام العمل</label>
            <select 
              value={workModel} 
              onChange={(e) => setWorkModel(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-emerald-500 focus:outline-none"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              {workModel === 'monthly' ? 'قيمة الراتب الشهري المقترح (ج.م)' : 'سعر الجلسة المقترح (ج.م)'}
            </label>
            <input 
              type="number" 
              value={requestedPrice}
              onChange={(e) => setRequestedPrice(parseInt(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500">
              يتم حساب نسبة المنصة تلقائياً. تأكد من أن السعر يقع ضمن النطاق المسموح به في سياسات المنصة.
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-800">الجدول الأسبوعي المتاح</h3>
          <p className="text-sm text-slate-500">
            حدد أوقات فراغك خلال الأسبوع. عند حجز الطالب لموعد، سيكون هذا الموعد ثابتاً بشكل أسبوعي طوال فترة التدريب.
          </p>
        </div>

        <div className="space-y-4">
          {DAYS.map(day => (
            <div key={day.key} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-slate-100 p-4">
              <div className="w-32 font-bold text-slate-800">{day.label}</div>
              <div className="flex flex-wrap gap-2">
                {['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(time => {
                  const isSelected = schedule.some(s => s.day === day.key && s.time === time);
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => toggleSlot(day.key, time)}
                      className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                        isSelected 
                          ? 'bg-emerald-500 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {isSaved && (
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
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
