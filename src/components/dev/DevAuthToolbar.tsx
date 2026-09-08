'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@/types';

const ROLES: { label: string; value: UserRole }[] = [
  { label: 'زائر', value: 'visitor' },
  { label: 'طالب', value: 'student' },
  { label: 'مدرب', value: 'instructor' },
  { label: 'ناشر', value: 'publisher' },
  { label: 'مشرف عام', value: 'general_supervisor' },
  { label: 'مدير نظام', value: 'super_admin' },
];

export default function DevAuthToolbar() {
  const [currentRole, setCurrentRole] = useState<UserRole>('visitor');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // قراءة الدور من localStorage إن وجد
    const savedRole = localStorage.getItem('dev_mock_role') as UserRole;
    if (savedRole && ROLES.some((r) => r.value === savedRole)) {
      setCurrentRole(savedRole);
    }
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    setCurrentRole(newRole);
    localStorage.setItem('dev_mock_role', newRole);
    // يمكنك أيضاً تعيين كوكيز هنا لتمكين الـ Server Components من قراءته
    document.cookie = `mockRole=${newRole}; path=/; max-age=86400`;
    window.location.reload(); // إعادة تحميل الصفحة لتطبيق الدور الجديد
  };

  if (!isMounted) return null;

  if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_SHOW_DEV_TOOLBAR !== 'true') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-3 font-mono text-sm text-white shadow-2xl rtl:right-auto rtl:left-4">
      <div className="flex flex-col">
        <span className="font-sans text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Dev Auth
        </span>
      </div>
      <div className="h-6 w-[1px] bg-slate-700"></div>
      <select
        value={currentRole}
        onChange={handleRoleChange}
        className="cursor-pointer rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
      >
        {ROLES.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label} ({role.value})
          </option>
        ))}
      </select>
    </div>
  );
}
