'use client';
import React, { useState } from 'react';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { UserProfile } from '@/types';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

export function UsersClient({ initialUsers }: { initialUsers: UserProfile[] }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filteredUsers = initialUsers.filter(user => {
    const matchesSearch = user.fullName.includes(search) || user.email.includes(search);
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const roleMap: Record<string, string> = {
    visitor: 'زائر',
    student: 'عميل / طالب',
    instructor: 'مدرب',
    publisher: 'ناشر',
    general_supervisor: 'مشرف عام',
    super_admin: 'مدير نظام',
  };

  const formattedUsers = filteredUsers.map(user => ({
    ...user,
    fullNameDisplay: (
      <Link href={`/dashboard/admin/users/${user.id}`} className="font-bold text-blue-600 hover:underline">
        {user.fullName}
      </Link>
    ),
    roleDisplay: (
      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
        {roleMap[user.role] || user.role}
      </span>
    ),
    guardianDisplay: user.isGuardian ? (
      <StatusBadge type="neutral" label="ولي أمر" />
    ) : (
      <span className="text-slate-400">-</span>
    ),
  }));

  const columns = [
    { header: 'الاسم', accessorKey: 'fullNameDisplay' },
    { header: 'البريد الإلكتروني', accessorKey: 'email' },
    { header: 'الدور', accessorKey: 'roleDisplay' },
    { header: 'حالة ولي الأمر', accessorKey: 'guardianDisplay' },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input 
          type="text" 
          placeholder="ابحث بالاسم أو البريد..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">جميع الأدوار</option>
          <option value="student">عميل / طالب</option>
          <option value="instructor">مدرب</option>
          <option value="publisher">ناشر</option>
          <option value="general_supervisor">مشرف عام</option>
          <option value="super_admin">مدير نظام</option>
        </select>
      </div>

      <SimpleDataTable columns={columns} data={formattedUsers} />
    </div>
  );
}
