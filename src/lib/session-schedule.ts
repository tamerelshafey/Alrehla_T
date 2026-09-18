import type { WeeklySlot, DayOfWeek } from '@/types';

/**
 * توليد مواعيد الجلسات.
 *
 * ليه موجودة: تأكيد الدفع كان بيحوّل الاشتراك لـ«نشط» و**مبيعملش ولا
 * جلسة**. ولوحة الطالب ولوحة المدرب الاتنين بيقروا من جدول الجلسات —
 * فالاتنين كانوا بيفضلوا فاضيين بعد كل عملية شراء ناجحة.
 *
 * المواعيد دي **مبدئية**: جلسة كل أسبوع في أول ميعاد من جدول المدرب
 * الأسبوعي. الإدارة بتعدّلها من شاشة الحجوزات، وأي تعديل بيوصل إشعار
 * للطرفين.
 *
 * عشان كده حالة الجلسة بتبقى `pending` مش `confirmed`: الميعاد اتحسب
 * مش اتفق عليه.
 */
const DAY_INDEX: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/** أول يوم مسموح: بعد بكرة. حجز بيبدأ النهارده مش واقعي. */
const LEAD_DAYS = 2;

export function buildSessionSchedule(params: {
  count: number;
  weeklySchedule?: WeeklySlot[] | null;
  /**
   * الموعد اللي العميل اختاره بنفسه وقت الحجز.
   *
   * له الأولوية المطلقة على جدول المدرب: ده اللي شافه في ملخص الحجز
   * ووافق عليه. من غيره كانت الجلسات بتتولّد من أول ميعاد فاضي في
   * الجدول، فالعميل يختار الثلاثاء ٦م ويتجدول الأحد ٤م.
   */
  preferredSlot?: WeeklySlot | { day: DayOfWeek; time: string } | null;
  /** من إمتى نبدأ نعدّ — عادةً لحظة تأكيد الدفع. */
  from?: Date;
}): string[] {
  const { count } = params;
  if (count <= 0) return [];

  const from = params.from ?? new Date();
  const earliest = new Date(from.getTime() + LEAD_DAYS * 24 * 60 * 60 * 1000);

  const slot = normalizePreferred(params.preferredSlot) ?? pickSlot(params.weeklySchedule);

  // مفيش جدول للمدرب (أو مفيش مدرب أصلًا): بنحجز نفس يوم وساعة التأكيد
  // أسبوعيًا. تخمين صريح، والإدارة بتصلّحه.
  const first = slot ? nextSlotDate(earliest, slot) : earliest;

  const dates: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const date = new Date(first.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    dates.push(date.toISOString());
  }
  return dates;
}

/**
 * اختيار العميل، بعد التأكد إنه مفهوم.
 *
 * يوم مش في أيام الأسبوع أو وقت فاضي = بنتجاهله ونرجع لجدول المدرب،
 * مش بنولّد مواعيد على قيمة بايظة.
 */
function normalizePreferred(
  slot?: WeeklySlot | { day: DayOfWeek; time: string } | null
): WeeklySlot | null {
  if (!slot || !slot.day || !slot.time) return null;
  if (!(slot.day in DAY_INDEX)) return null;
  return { day: slot.day, time: slot.time, isBooked: false } as WeeklySlot;
}

/** أول ميعاد غير محجوز في الجدول، بترتيب أيام الأسبوع. */
function pickSlot(schedule?: WeeklySlot[] | null): WeeklySlot | null {
  if (!Array.isArray(schedule) || schedule.length === 0) return null;
  const free = schedule.filter((s) => !s.isBooked && s.day in DAY_INDEX && s.time);
  if (free.length === 0) return null;
  return [...free].sort(
    (a, b) =>
      DAY_INDEX[a.day] - DAY_INDEX[b.day] || a.time.localeCompare(b.time)
  )[0];
}

/** أقرب تاريخ في أو بعد `earliest` يقع في يوم وساعة الميعاد. */
function nextSlotDate(earliest: Date, slot: WeeklySlot): Date {
  const [hours, minutes] = slot.time.split(':').map((n) => parseInt(n, 10));
  const target = DAY_INDEX[slot.day];

  const date = new Date(earliest);
  date.setHours(
    Number.isFinite(hours) ? hours : 16,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0
  );

  // لو الساعة عدّت النهارده، ابدأ من بكرة قبل ما تدوّر على اليوم.
  if (date.getTime() < earliest.getTime()) {
    date.setDate(date.getDate() + 1);
  }

  const diff = (target - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  return date;
}
