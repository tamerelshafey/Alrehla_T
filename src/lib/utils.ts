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
