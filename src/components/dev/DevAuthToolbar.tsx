'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@/types';

const ROLES: { label: string; value: UserRole }[] = [
  { label: 'زائر', value: 'visitor' },
  { label: 'طالب', value: 'student' },
  { label: 'مدرب', value: 'instructor' },
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

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-sm font-mono rtl:right-auto rtl:left-4">
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-sans font-bold">Dev Auth</span>
      </div>
      <div className="w-[1px] h-6 bg-slate-700"></div>
      <select 
        value={currentRole} 
        onChange={handleRoleChange}
        className="bg-slate-800 border border-slate-600 text-white rounded-lg px-2 py-1 outline-none focus:border-blue-500 cursor-pointer text-xs"
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
