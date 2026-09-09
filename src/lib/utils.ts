import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { UserProfile, AdminPermission } from '@/types';

export function hasAdminPermission(user: UserProfile, permission: AdminPermission): boolean {
  if (user.role !== 'super_admin' && user.role !== 'general_supervisor') {
    return false;
  }
  return user.permissions?.includes(permission) || false;
}


export function formatDate(dateInput: string | Date): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}


export function assertSingleParticipant(
  dependentId?: string,
  independentId?: string,
  requireOne: boolean = true
): void {
  const count = [dependentId, independentId].filter(Boolean).length;
  if (requireOne && count !== 1) {
    throw new Error('يجب تحديد مشارك واحد بالضبط: إما تابع أو مستقل');
  }
  if (!requireOne && count > 1) {
    throw new Error('لا يمكن تحديد أكثر من مشارك واحد');
  }
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
