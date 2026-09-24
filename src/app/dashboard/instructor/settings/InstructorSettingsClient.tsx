'use client';
import React, { useState } from 'react';
import { useAction } from '@/lib/use-action';
import { FormError } from '@/components/ui/FormError';
import { Instructor, DayOfWeek, WeeklySlot, PricingFormulaSettings } from '@/types';
import { Calendar, Clock, Info, CheckCircle2, Save } from 'lucide-react';
import { calculateFinalSessionPrice } from '@/lib/utils';
import { submitInstructorProfileUpdate } from '@/actions/instructors';

interface InstructorSettingsClientProps {
  instructor: Instructor;
  /**
   * بتُستخدم عشان نوري المدرب **سعر العميل** جنب حصيلته.
   * المعادلة نفسها مش معروضة — تسعير داخلي.
   */
  formulaSettings: PricingFormulaSettings;
  /** فوق الرقم ده بيظهر تنبيه — والمدرب يقدر يكمل. صفر = مفيش تنبيه. */
  priceAlert?: number;
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

export function InstructorSettingsClient({
  instructor,
  formulaSettings,
  priceAlert = 0,
}: InstructorSettingsClientProps) {
  const [workModel, setWorkModel] = useState(instructor.workModel || 'per_session');
  const [monthlyHours, setMonthlyHours] = useState(instructor.monthlyHoursCommitted || 60);
  const [requestedPrice, setRequestedPrice] = useState(instructor.requestedPrice || 100);
  const [schedule, setSchedule] = useState<WeeklySlot[]>(instructor.weeklySchedule || []);
  const [isSaved, setIsSaved] = useState(false);

  // ── ليه بقى منتقي وقت بدل أزرار ثابتة ──────────────────────
  //
  // الشاشة كانت بتدّي ست ساعات بس (10، 12، 14، 16، 18، 20) — يعني
  // مدرب بيشتغل 9 الصبح أو 9 بالليل مالوش أي طريقة يسجّل ميعاده.
  // شبكة 24×7 كاملة معناها 168 زرار على الشاشة، فبدلها: اختار يوم
  // ووقت واضغط «إضافة». أي وقت مسموح، وبأي دقيقة.
  const [newDay, setNewDay] = useState<DayOfWeek>('saturday');
  const [newTime, setNewTime] = useState('16:00');
  const [slotError, setSlotError] = useState('');

  const addSlot = () => {
    setSlotError('');
    if (!/^\d{2}:\d{2}$/.test(newTime)) {
      setSlotError('اكتب الوقت بصيغة صحيحة');
      return;
    }
    if (schedule.some((s) => s.day === newDay && s.time === newTime)) {
      setSlotError('الميعاد ده مضاف عندك بالفعل');
      return;
    }
    setSchedule([...schedule, { day: newDay, time: newTime, commitmentType: 'ongoing' }]);
  };

  const removeSlot = (day: DayOfWeek, time: string) => {
    setSchedule(schedule.filter((s) => !(s.day === day && s.time === time)));
  };

  /** الجدول مرتّبًا: باليوم ثم بالساعة. */
  const orderedSchedule = [...schedule].sort(
    (a, b) =>
      DAYS.findIndex((d) => d.key === a.day) - DAYS.findIndex((d) => d.key === b.day) ||
      a.time.localeCompare(b.time),
  );

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

  /**
   * ⚠️ كانت `await` عارية بلا `try` ولا حالة انتظار — والأكشن بيرمي.
   *    يعني المدرب يضبط جدوله وحصيلته، يدوس «حفظ وإرسال للاعتماد»،
   *    ومفيش أي رد فعل: لا رسالة نجاح ولا خطأ. ولو نجح، الزر مفتوح
   *    فيدوس تاني ويبعت طلبين للإدارة.
   */
  const save = useAction(submitInstructorProfileUpdate, {
    onSuccess: () => {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    },
    fallbackError: 'تعذّر إرسال التعديلات للإدارة.',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(false);
    await save.run(instructor.id, {
      workModel: workModel as any,
      monthlyHoursCommitted: workModel === 'monthly' ? monthlyHours : undefined,
      // الحصيلة بتتبعت في الحالتين: راتب شهري مقترح، أو حصيلة الجلسة.
      // كانت بتتبعت في حالة الشهري بس، والجلسة بتتاخد من «فئة سعر»
      // ثابتة (مبتدئ / متوسط / خبير) — واللي اتشالت.
      requestedPrice: Number(requestedPrice),
      weeklySchedule: schedule
    });
  };

  // سعر العميل من حصيلة المدرب مباشرة. كان بيتحسب من «فئة السعر»
  // المختارة، والفئات اتشالت.
  const finalPrice =
    Number(requestedPrice) > 0
      ? calculateFinalSessionPrice(Number(requestedPrice), formulaSettings)
      : 0;

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
              {/*
                كانت هنا قائمة «فئات سعر» ثابتة (مبتدئ / متوسط / خبير)
                من جدول `instructor_pricing_options` — المدرب يختار
                واحدة منها وبس. مفيش تلات أرقام تناسب كل المدربين وكل
                الباقات، فبقى يكتب حصيلته بنفسه، والإدارة بتراجعها زي
                أي رقم تاني قبل الاعتماد.
              */}
              <label className="text-sm font-bold text-slate-700">
                حصيلتك من الجلسة الواحدة (ج.م)
              </label>
              <input
                type="number"
                min={1}
                value={requestedPrice}
                onChange={(e) => setRequestedPrice(Number(e.target.value))}
                placeholder="اكتب الرقم المناسب لك"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-amber-500 focus:outline-none"
              />

              {finalPrice > 0 && (
                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <span className="font-bold">حصيلتك:</span> {requestedPrice} ج.م —{' '}
                  <span className="font-bold">السعر الذي يظهر للعميل:</span> {finalPrice} ج.م
                </div>
              )}

              {/* تنبيه لا منع — والإدارة بتراجع كل رقم قبل الاعتماد. */}
              {priceAlert > 0 && Number(requestedPrice) > priceAlert && (
                <p className="mt-2 rounded-lg bg-amber-100 p-2 text-xs font-bold text-amber-800">
                  الرقم ده أعلى من المعتاد ({priceAlert} ج.م). تقدر تكمل، وهتراجعه
                  الإدارة قبل الاعتماد.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-800">الجدول الأسبوعي المتاح</h3>
          <p className="text-sm text-slate-500">
            أضف أي موعد في أي يوم وأي ساعة. لما طالب يحجز موعدًا، الموعد ده
            بيبقى ثابت له أسبوعيًا طول مدة الباقة، وبيختفي من المتاح لغيره
            لحد ما الباقة تخلص.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">اليوم</label>
            <select
              value={newDay}
              onChange={(e) => setNewDay(e.target.value as DayOfWeek)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500"
            >
              {DAYS.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">الساعة</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={addSlot}
            className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-600"
          >
            إضافة الموعد
          </button>

          {slotError && (
            <p className="w-full text-xs font-bold text-red-600">{slotError}</p>
          )}
        </div>

        {orderedSchedule.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm font-bold text-slate-400">
            لسه ما أضفتش أي موعد. الطلاب مش هيقدروا يحجزوا معاك من غير مواعيد.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {orderedSchedule.map((slot) => (
              <div
                key={`${slot.day}-${slot.time}`}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3"
              >
                <span className="min-w-24 font-bold text-slate-800">
                  {DAYS.find((d) => d.key === slot.day)?.label}
                </span>
                <span className="font-black text-amber-700">{slot.time}</span>

                <select
                  value={slot.commitmentType || 'ongoing'}
                  onChange={(e) =>
                    updateSlotCommitment(slot.day, slot.time, 'commitmentType', e.target.value)
                  }
                  className="rounded-lg border border-amber-200 bg-white py-1 px-2 text-xs font-bold text-amber-800 outline-none focus:border-amber-400"
                >
                  <option value="ongoing">مستمر</option>
                  <option value="fixed_term">فترة محددة</option>
                </select>

                {slot.commitmentType === 'fixed_term' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={slot.commitmentMonths || 1}
                      onChange={(e) =>
                        updateSlotCommitment(slot.day, slot.time, 'commitmentMonths', e.target.value)
                      }
                      className="w-16 rounded-lg border border-amber-200 bg-white py-1 px-2 text-xs font-bold text-amber-800 outline-none focus:border-amber-400"
                    />
                    <span className="text-xs font-bold text-amber-700">شهور</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeSlot(slot.day, slot.time)}
                  className="mr-auto rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <FormError message={save.error} />

      <div className="flex justify-end gap-4">
        {isSaved && (
          <div className="flex items-center gap-2 text-amber-600 font-bold">
            <CheckCircle2 className="h-5 w-5" />
            <span>تم إرسال الطلب للإدارة للمراجعة</span>
          </div>
        )}
        <button
          type="submit"
          disabled={save.pending}
          aria-busy={save.pending || undefined}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {save.pending ? 'جارٍ الإرسال…' : 'حفظ وإرسال للاعتماد'}
        </button>
      </div>
    </form>
  );
}
