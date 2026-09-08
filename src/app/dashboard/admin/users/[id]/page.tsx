import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getAllUsers } from '@/data/mock';
import { hasAdminPermission, formatDate } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageUsers')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const allUsers = await getAllUsers();
  const targetUser = allUsers.find(u => u.id === id) || allUsers[0];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="تفاصيل المستخدم" backHref="/dashboard/admin/users" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800">{targetUser.fullName}</h2>
            <p className="text-slate-500 mt-1">{targetUser.email}</p>
          </div>
          <div className="flex gap-3">
            {targetUser.isGuardian && (
              <Link href={`/dashboard/admin/users/${targetUser.id}/children`} className="rounded-xl bg-blue-50 px-4 py-2 font-bold text-blue-600 transition-colors hover:bg-blue-100">
                إدارة الأبناء
              </Link>
            )}
            <button className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 transition-colors hover:bg-red-100">
              إيقاف الحساب
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">الدور</div>
            <div className="font-bold text-slate-800">{targetUser.role}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">تاريخ التسجيل</div>
            <div className="font-bold text-slate-800">{formatDate(targetUser.createdAt)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">حالة ولي الأمر</div>
            <div className="font-bold text-slate-800">{targetUser.isGuardian ? 'نعم' : 'لا'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
