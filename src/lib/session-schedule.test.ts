import { describe, expect, it } from 'vitest';
import { buildSessionSchedule } from './session-schedule';
import type { WeeklySlot } from '@/types';

/** الثلاثاء ١٦ سبتمبر ٢٠٢٥، الساعة ١٢ ظهرًا. */
const FROM = new Date(2025, 8, 16, 12, 0, 0, 0);

describe('buildSessionSchedule', () => {
  it('بيعمل عدد الجلسات المطلوب', () => {
    expect(buildSessionSchedule({ count: 8, from: FROM })).toHaveLength(8);
  });

  it('بيرجع فاضي لو الباقة بلا جلسات', () => {
    expect(buildSessionSchedule({ count: 0, from: FROM })).toEqual([]);
  });

  it('بيحط أسبوع كامل بين كل جلستين', () => {
    const dates = buildSessionSchedule({ count: 3, from: FROM }).map(
      (d) => new Date(d).getTime()
    );
    const week = 7 * 24 * 60 * 60 * 1000;
    expect(dates[1] - dates[0]).toBe(week);
    expect(dates[2] - dates[1]).toBe(week);
  });

  it('بيبدأ بعد يومين على الأقل — مش نفس اليوم', () => {
    const first = new Date(buildSessionSchedule({ count: 1, from: FROM })[0]);
    expect(first.getTime()).toBeGreaterThanOrEqual(
      FROM.getTime() + 2 * 24 * 60 * 60 * 1000
    );
  });

  it('بيمشي على يوم وساعة جدول المدرب', () => {
    const schedule: WeeklySlot[] = [{ day: 'monday', time: '17:30' }];
    const dates = buildSessionSchedule({ count: 4, from: FROM, weeklySchedule: schedule });

    for (const iso of dates) {
      const date = new Date(iso);
      expect(date.getDay()).toBe(1); // الإتنين
      expect(date.getHours()).toBe(17);
      expect(date.getMinutes()).toBe(30);
    }
  });

  it('بيختار أول ميعاد في الأسبوع ويتجاهل المحجوز', () => {
    const schedule: WeeklySlot[] = [
      { day: 'wednesday', time: '10:00' },
      { day: 'sunday', time: '09:00', isBooked: true },
      { day: 'monday', time: '18:00' },
    ];
    const first = new Date(
      buildSessionSchedule({ count: 1, from: FROM, weeklySchedule: schedule })[0]
    );
    // الأحد محجوز، فأول ميعاد متاح هو الإتنين.
    expect(first.getDay()).toBe(1);
    expect(first.getHours()).toBe(18);
  });

  it('اختيار العميل بيغلب أول ميعاد في جدول المدرب', () => {
    // الجدول أوله الأحد، والعميل اختار الأربعاء. الجلسات لازم تبقى
    // على اختيار العميل — ده اللي شافه في ملخص الحجز.
    const schedule: WeeklySlot[] = [
      { day: 'sunday', time: '09:00' },
      { day: 'wednesday', time: '19:00' },
    ];
    const dates = buildSessionSchedule({
      count: 3,
      from: FROM,
      weeklySchedule: schedule,
      preferredSlot: { day: 'wednesday', time: '19:00' },
    });
    expect(dates).toHaveLength(3);
    for (const iso of dates) {
      const d = new Date(iso);
      expect(d.getDay()).toBe(3);
      expect(d.getHours()).toBe(19);
    }
  });

  it('اختيار بايظ بيترجع لجدول المدرب بدل ما يولّد مواعيد غلط', () => {
    const schedule: WeeklySlot[] = [{ day: 'monday', time: '17:30' }];
    const first = new Date(
      buildSessionSchedule({
        count: 1,
        from: FROM,
        weeklySchedule: schedule,
        // يوم مش موجود في أيام الأسبوع
        preferredSlot: { day: 'funday' as never, time: '19:00' },
      })[0]
    );
    expect(first.getDay()).toBe(1);
    expect(first.getHours()).toBe(17);
  });

  it('جدول فاضي = أسبوعي من أول ميعاد متاح بعد يومين', () => {
    const dates = buildSessionSchedule({ count: 2, from: FROM, weeklySchedule: [] });
    expect(dates).toHaveLength(2);
    // مفيش جدول للمدرب، فالبداية بعد يومين بالظبط والباقي كل أسبوع.
    expect(new Date(dates[0]).getTime()).toBe(FROM.getTime() + 2 * 24 * 60 * 60 * 1000);
    expect(new Date(dates[1]).getDay()).toBe(new Date(dates[0]).getDay());
  });
});
