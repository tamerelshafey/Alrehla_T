'use client';
import React, { useState } from 'react';
import { useAction } from '@/lib/use-action';
import { FormError } from '@/components/ui/FormError';
import { Instructor, DayOfWeek, WeeklySlot, PricingFormulaSettings } from '@/types';
import { Calendar, Clock, Info, CheckCircle2, Save } from 'lucide-react';
import { calculateFinalSessionPrice } from '@/lib/utils';
import { submitInstructorProfileUpdate } from '@/actions/instructors';
import { PackagePicker, type PackageChoice } from '@/components/dashboard/PackagePicker';
import { WeeklySchedulePicker } from '@/components/dashboard/WeeklySchedulePicker';

interface InstructorSettingsClientProps {
  instructor: Instructor;
  /**
   * بتُستخدم عشان نوري المدرب **سعر العميل** جنب حصيلته.
   * المعادلة نفسها مش معروضة — تسعير داخلي.
   */
  formulaSettings: PricingFormulaSettings;
  /** فوق الرقم ده بيظهر تنبيه — والمدرب يقدر يكمل. صفر = مفيش تنبيه. */
  priceAlert?: number;
  /** الباقات المفعّلة اللي المدرب يقدر يختار منها. */
  packages: PackageChoice[];
  /** اللي هو مسجَّل عليها دلوقتي — فاضية = كل الباقات (ملف SQL 102). */
  selectedPackageIds: string[];
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
  packages,
  selectedPackageIds,
}: InstructorSettingsClientProps) {
  const [workModel, setWorkModel] = useState(instructor.workModel || 'per_session');
  const [monthlyHours, setMonthlyHours] = useState(instructor.monthlyHoursCommitted || 60);
  const [requestedPrice, setRequestedPrice] = useState(instructor.requestedPrice || 100);
  const [schedule, setSchedule] = useState<WeeklySlot[]>(instructor.weeklySchedule || []);
  const [pickedPackages, setPickedPackages] = useState<string[]>(selectedPackageIds);
  const [isSaved, setIsSaved] = useState(false);



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
      // في نظام الراتب الشهري لا توجد قيمة للراتب المقترح بل يتم التواصل مع الإدارة
      requestedPrice: workModel === 'monthly' ? undefined : Number(requestedPrice),
      weeklySchedule: schedule,
      // ⚠️ **الباقات بتتبعت كاقتراح، مش بتتطبّق.** الإدارة هي اللي
      //    بتوافق، والموافقة هي اللي بتكتب في جدول الربط (ملف 102).
      //    فلو المدرب حط نفسه في باقة مش مؤهّل لها، الاختيار يقف عند
      //    الطلب.
      packageIds: pickedPackages,
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
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">عدد الساعات الملتزم بها شهرياً (الحد الأدنى 60)</label>
                <input 
                  type="number" 
                  min={60}
                  value={monthlyHours}
                  onChange={(e) => setMonthlyHours(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Info className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>التواصل المباشر مع الإدارة لتحديد الراتب</span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  في نظام الراتب الشهري، لا يتم تحديد راتب مقترح هنا بل يكون التنسيق والتواصل المباشر مع إدارة المنصة للاتفاق على قيمة الراتب الشهري والشروط التعاقدية المناسبة.
                </p>
              </div>
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
          <h3 className="text-lg font-black text-slate-800">الباقات اللي تقدر تدرّبها</h3>
          <p className="text-sm text-slate-500">
            اختيارك هنا <strong>اقتراح</strong> — الإدارة بتراجعه مع باقي تعديلاتك،
            وبيتطبّق بعد الموافقة.
          </p>
        </div>
        <PackagePicker
          packages={packages}
          selected={pickedPackages}
          onChange={setPickedPackages}
          disabled={save.pending}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-800">الجدول الأسبوعي المتاح (7 أيام)</h3>
          <p className="text-sm text-slate-500 mt-1">
            اختر أوقات وساعات عملك مقسمة على مدار الأيام السبعة. يمكنك تحديد مواعيد دائمة مستمرة، أو مواعيد مؤقتة تنتهي بتاريخ محدد باليوم.
          </p>
        </div>

        <WeeklySchedulePicker
          schedule={schedule}
          onChange={setSchedule}
          disabled={save.pending}
        />
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
