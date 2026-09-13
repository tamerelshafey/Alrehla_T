/**
 * بيانات تجريبية للتطوير المحلي فقط — لا تُستخدم في الموقع المنشور.
 *
 * Development-only sample data. Nothing here is real, and nothing here is
 * exported to pages: the read functions in `src/data/domains` fall back to it
 * only when NODE_ENV is 'development'.
 */

import {
  UserProfile, UserRole, AdminPermission
} from '@/types';

export const mockCurrentUser: UserProfile = {
  id: 'current-user',
  fullName: 'زائر تجريبي',
  email: 'visitor@example.com',
  role: 'visitor',
  createdAt: '2023-01-01T00:00:00Z',
};

export const mockAllUsers: UserProfile[] = [
  { id: 'usr-1', fullName: 'أحمد محمود', email: 'ahmed@example.com', role: 'student', createdAt: '2023-01-10T00:00:00Z', isGuardian: false },
  { id: 'usr-2', fullName: 'سارة خالد', email: 'sara@example.com', role: 'instructor', createdAt: '2023-02-15T00:00:00Z' },
  { id: 'usr-3', fullName: 'علياء حسين', email: 'alia@example.com', role: 'publisher', createdAt: '2023-03-20T00:00:00Z' },
  { id: 'usr-4', fullName: 'محمد طارق', email: 'mohamed@example.com', role: 'super_admin', createdAt: '2023-01-01T00:00:00Z' },
  { id: 'usr-5', fullName: 'نور مصطفى', email: 'nour@example.com', role: 'general_supervisor', createdAt: '2023-04-10T00:00:00Z' },
  { id: 'usr-6', fullName: 'ياسر عادل', email: 'yasser@example.com', role: 'visitor', createdAt: '2023-05-12T00:00:00Z' },
  { id: 'usr-7', fullName: 'مريم أمين', email: 'mariam@example.com', role: 'student', createdAt: '2023-06-18T00:00:00Z', isGuardian: true },
  { id: 'usr-8', fullName: 'خالد وليد', email: 'khaled@example.com', role: 'instructor', createdAt: '2023-07-22T00:00:00Z' },
];
