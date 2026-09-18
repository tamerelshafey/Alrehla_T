import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { UserProfile, AdminPermission } from '@/types';
import { PLATFORM_TIMEZONE } from '@/lib/timezone';

export function hasAdminPermission(user: UserProfile, permission: AdminPermission): boolean {
  if (user.role !== 'super_admin' && user.role !== 'general_supervisor') {
    return false;
  }
  return user.permissions?.includes(permission) || false;
}


export function formatDate(dateInput: string | Date): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('ar-EG', { timeZone: PLATFORM_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}


export function calculateFinalSessionPrice(
  basePricePerSession: number,
  formula: { platformMultiplier: number; fixedAdminFee: number }
): number {
  return basePricePerSession * formula.platformMultiplier + formula.fixedAdminFee;
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('ar-EG')} ج.م`;
}

export function calculateAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const dob = new Date(birthDate);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age < 0 ? null : age;
}

/**
 * فك تشفير الاسم اللي في الرابط.
 *
 * الأسماء العربية بتتشفّر في الروابط (%D8%A7…)، والمقارنة باللي متخزّن
 * في القاعدة بتفشل من غير فك التشفير — وده اللي كان بيخلي مقالات
 * المدونة تطلع «غير موجودة» وهي ظاهرة في القايمة.
 */
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    // رابط مشفّر بشكل غلط — بنرجّعه زي ما هو.
    return slug;
  }
}
