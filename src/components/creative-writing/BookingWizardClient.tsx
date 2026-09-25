'use client';
import React, { useState } from 'react';
import { PublicInstructor, WeeklySlot, BookedSlot, DayOfWeek } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Calendar, Clock, User, ArrowRight, Video } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PersonAvatar } from '@/components/ui/PersonAvatar';
import { PLATFORM_TIMEZONE } from '@/lib/timezone';

const DAY_ORDER: DayOfWeek[] = [
  'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
];

/** كان اليوم بيتكتب بالإنجليزي حرفيًا («saturday») في صفحة عربية. */
const DAY_LABELS: Record<DayOfWeek, string> = {
  saturday: 'السبت',
  sunday: 'الأحد',
  monday: 'الإثنين',
  tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء',
  thursday: 'الخميس',
  friday: 'الجمعة',
};

type PackageOption = {
  id: string;
  name: string;
  price: number;
  ageGroup: 'under_12' | '12_plus';
};

interface BookingWizardProps {
  /**
   * ⚠️ `PublicInstructor` مش `Instructor` عن قصد.
   *
   * ده **مكوّن عميل** — كل حاجة بتتبعتله بتتكتب في حمولة الصفحة اللي
   * بتوصل المتصفح. لما كان بياخد `Instructor` كامل، كان `approvedPrice`
   * و`requestedPrice` و`monthlyHoursCommitted` بيتكتبوا حرفيًا في صفحة
   * الحجز العامة. المكوّن مش محتاج غير الاسم والحالة والمواعيد.
   */
  instructors: PublicInstructor[];
  /**
   * الباقات الحقيقية من قاعدة البيانات.
   *
   * كانت القايمة تلات أسماء مكتوبة في الكود، **والاسم نفسه** هو اللي
   * بيتبعت كرقم الباقة ويتخزن في الاشتراك. يعني الاشتراكات كانت
   * مربوطة بنص مش بباقة.
   */
  packages: PackageOption[];
  /** المواعيد المحجوزة فعلًا لكل مدرب، محسوبة من جلساته القادمة. */
  bookedSlots: Record<string, BookedSlot[]>;
}

export function BookingWizardClient({
  instructors,
  packages,
  bookedSlots,
}: BookingWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // الباقة اللي جاية من صفحة الباقات، لو كانت لسه متاحة.
  const requestedPackage = searchParams?.get('package') ?? '';
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(
    packages.some((pkg) => pkg.id === requestedPackage)
      ? requestedPackage
      : (packages[0]?.id ?? ''),
  );
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<WeeklySlot | null>(null);

  const activeInstructors = instructors.filter(i => i.status === 'active');

  /** الميعاد محجوز لحد امتى؟ فاضي = متاح. */
  const bookedUntilFor = (instructorId: string, slot: WeeklySlot): string | null => {
    const taken = (bookedSlots[instructorId] ?? []).find(
      (b) => b.day === slot.day && b.time === slot.time,
    );
    return taken?.bookedUntil ?? null;
  };

  const formatUntil = (iso: string) =>
    new Date(iso).toLocaleDateString('ar-EG', { timeZone: PLATFORM_TIMEZONE,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  const chosenPackage = packages.find((pkg) => pkg.id === selectedPackage);
  const selectedInstructor = activeInstructors.find(i => i.id === selectedInstructorId);

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    // الموعد اللي العميل اختاره في الخطوة التانية كان بيقف هنا: الرابط
    // كان بيشيل الباقة والمدرب وبس، فالاختيار يضيع في المتصفح والجلسات
    // تتولّد بعدين من أول ميعاد فاضي في جدول المدرب. العميل يختار
    // الثلاثاء ٦م ويتجدول الأحد ٤م.
    const params = new URLSearchParams({
      package: selectedPackage,
      instructor: selectedInstructorId,
    });
    if (selectedSlot) {
      params.set('day', selectedSlot.day);
      params.set('time', selectedSlot.time);
    }
    router.push(`/creative-writing/booking/confirm?${params.toString()}`);
  };

  return (
    <Card accentColor="emerald" className="p-6 md:p-10 shadow-xl shadow-slate-200/50">
      <form onSubmit={handleConfirm} className="space-y-8">
        
        {/* Step 1: Package & Instructor */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">1</div>
                اختيار الباقة والمدرب
              </h2>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الباقة المختارة</label>
                <select 
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-emerald-500"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — {formatPrice(pkg.price)}
                    </option>
                  ))}
                </select>
                {chosenPackage && (
                  <p className="text-xs font-medium text-slate-500">
                    {chosenPackage.ageGroup === 'under_12'
                      ? 'الباقة دي مصمّمة لأقل من 12 سنة — توضيح للمساعدة في الاختيار، والحجز متاح في كل الأحوال.'
                      : 'الباقة دي مصمّمة لـ 12 سنة فأكثر — توضيح للمساعدة في الاختيار، والحجز متاح في كل الأحوال.'}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700">المدرب المفضل</label>
                {activeInstructors.length === 0 && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
                    مفيش مدربين مفعّلين حاليًا. المدرب لازم تكون حالته
                    «مفعّل» في لوحة الإدارة عشان يظهر هنا بمواعيده.
                  </p>
                )}
                {/*
                  ⚠️ `role="radiogroup"` و`role="radio"`: الكروت دي كانت
                     `<div onClick>` وبس — **مفيش أي وصول بالكيبورد**.
                     يعني اللي بيتنقّل بـTab (أو بقارئ شاشة) **مش قادر
                     يختار مدربًا من أصله**، ومسار الشراء بيقف عنده.
                     دلوقتي: `tabIndex` و`aria-checked` وEnter/Space.
                */}
                <div
                  role="radiogroup"
                  aria-label="اختيار المدرب"
                  className="grid gap-4 md:grid-cols-2"
                >
                  {activeInstructors.map(inst => (
                    <div 
                      key={inst.id}
                      role="radio"
                      aria-checked={selectedInstructorId === inst.id}
                      tabIndex={0}
                      onClick={() => { setSelectedInstructorId(inst.id); setSelectedSlot(null); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedInstructorId(inst.id);
                          setSelectedSlot(null);
                        }
                      }}
                      className={`cursor-pointer rounded-2xl border-2 p-4 transition-[border-color,box-shadow] duration-200 ease-[var(--ease-ui)] ${
                        selectedInstructorId === inst.id 
                          ? 'border-journey-border bg-journey-soft shadow-md' 
                          : 'border-slate-100 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/*
                          صورة المدرب — **كانت مش موجودة هنا خالص.**

                          الكارت كان بيرسم دايرة رمادية فيها أول حرف من
                          الاسم وبس، مهما كانت الصورة مرفوعة. والنمط ده
                          اتكرر في **خمس** شاشات، فبقى في مكوّن واحد
                          (`PersonAvatar`) بدل ما يتنسخ في كل واحدة.
                        */}
                        <PersonAvatar name={inst.displayName} avatarUrl={inst.avatarUrl} />
                        <div>
                          <h4 className="font-bold text-slate-800">{inst.displayName}</h4>
                          <p className="text-xs text-slate-500">{inst.specialties.join('، ')}</p>
                        </div>
                      </div>

                      {/* نبذة وخبرة المدرب في نفس الصفحة: كان لازم العميل
                          يخرج لصفحة المدرب عشان يقرر. */}
                      {inst.bio && (
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3">
                          {inst.bio}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                        {inst.yearsExperience > 0 && (
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                            {inst.yearsExperience} سنة خبرة
                          </span>
                        )}
                        <a
                          href={`/creative-writing/instructors/${inst.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-emerald-700 underline"
                        >
                          الملف الكامل
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Button
              type="button"
              onClick={handleNext}
              disabled={!selectedInstructorId}
              accentColor="emerald"
              className="w-full py-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              متابعة لاختيار الموعد
              <ArrowRight className="h-5 w-5 rotate-180" />
            </Button>
          </div>
        )}

        {/* Step 2: Recurring Slot */}
        {step === 2 && selectedInstructor && (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">2</div>
                الموعد الأسبوعي الثابت
              </h2>
              
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-bold mb-1">الجدول الأسبوعي:</p>
                <p>يتم اختيار الموعد مرة واحدة، وسيكون هو <strong>موعدك الثابت في نفس اليوم والساعة أسبوعياً</strong> طوال فترة الباقة.</p>
              </div>

              {(!selectedInstructor.weeklySchedule || selectedInstructor.weeklySchedule.length === 0) ? (
                <p className="text-slate-500 text-center py-4">لا توجد مواعيد متاحة حالياً لهذا المدرب.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {DAY_ORDER.map(dayKey => {
                    // بنعرض المواعيد المحجوزة كمان — معطّلة ومكتوب عليها
                    // «محجوز حتى». اختفاؤها كان بيخلي العميل يفتكر إن
                    // المدرب مش شغّال في الوقت ده أصلًا.
                    const daySlots = selectedInstructor.weeklySchedule
                      .filter(s => s.day === dayKey)
                      .sort((a, b) => a.time.localeCompare(b.time));
                    if (daySlots.length === 0) return null;
                    return (
                      <div key={dayKey} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <h4 className="font-bold text-slate-700 mb-3">{DAY_LABELS[dayKey]}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {daySlots.map(s => {
                            const isSelected = selectedSlot?.day === s.day && selectedSlot?.time === s.time;
                            const bookedUntil = bookedUntilFor(selectedInstructor.id, s);
                            if (bookedUntil) {
                              return (
                                <div
                                  key={s.time}
                                  className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-center"
                                >
                                  <span className="block text-sm font-bold text-slate-400 line-through">
                                    {s.time}
                                  </span>
                                  <span className="block text-[10px] font-bold leading-tight text-slate-500">
                                    محجوز حتى {formatUntil(bookedUntil)}
                                  </span>
                                </div>
                              );
                            }
                            return (
                              <button
                                key={s.time}
                                type="button"
                                onClick={() => setSelectedSlot(s)}
                                className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400'
                                }`}
                              >
                                {s.time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handlePrev}
                variant="secondary"
                accentColor="emerald"
                className="w-1/3 py-4 text-center"
              >
                رجوع
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!selectedSlot}
                accentColor="emerald"
                className="flex-1 py-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                متابعة البيانات
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: User Info & Confirm */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">3</div>
                تأكيد البيانات والحجز
              </h2>
              
              {/*
                كان هنا حقلين: «اسم المتدرب» و«مجال الاهتمام». الاتنين
                `required` — يعني بيوقّفوا العميل لحد ما يملاهم — وبلا
                `name` وبلا state، فمحدش كان بيقراهم ومحدش بيبعتهم. اتشالوا.
                المتدرب نفسه بيتحدد في الصفحة الجاية (أنا / أحد أفراد
                العائلة) من بيانات الحساب الحقيقية.
              */}

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <h3 className="font-bold text-slate-800 mb-4">ملخص الحجز:</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex justify-between border-b border-slate-200 pb-2">
                    <span>الباقة:</span>
                    <span className="font-bold text-slate-800">{chosenPackage?.name ?? '—'}</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-200 pb-2">
                    <span>سعر الباقة:</span>
                    <span className="font-bold text-slate-800">
                      {chosenPackage ? formatPrice(chosenPackage.price) : '—'}
                    </span>
                  </li>
                  <li className="flex justify-between border-b border-slate-200 pb-2">
                    <span>المدرب:</span>
                    <span className="font-bold text-slate-800">{selectedInstructor?.displayName}</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-200 pb-2">
                    <span>الموعد الأسبوعي (يومي وثابت):</span>
                    <span className="font-bold text-emerald-600">
                      {selectedSlot ? `${DAY_LABELS[selectedSlot.day]} - الساعة ${selectedSlot.time}` : '—'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handlePrev}
                variant="secondary"
                accentColor="emerald"
                className="w-1/3 py-4 text-center"
              >
                رجوع
              </Button>
              <Button
                type="submit"
                accentColor="emerald"
                className="flex-1 !bg-slate-900 !text-white hover:!bg-slate-800 py-4 text-center"
              >
                تأكيد الحجز والدفع
              </Button>
            </div>
          </div>
        )}
      </form>
    </Card>
  );
}
