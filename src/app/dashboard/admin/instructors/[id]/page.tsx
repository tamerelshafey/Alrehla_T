import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getInstructors } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageInstructors')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const instructors = await getInstructors();
  const target = instructors.find(i => i.id === id) || instructors[0];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="تفاصيل المدرب" backHref="/dashboard/admin/instructors" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800">{target.displayName}</h2>
            <p className="text-slate-500 mt-1">{target.specialties.join('، ')}</p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl bg-green-50 px-4 py-2 font-bold text-green-600 transition-colors hover:bg-green-100">
              تفعيل
            </button>
            <button className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 transition-colors hover:bg-red-100">
              تعليق
            </button>
            <Link href={`/dashboard/admin/instructors/${target.id}/sessions`} className="rounded-xl bg-blue-50 px-4 py-2 font-bold text-blue-600 transition-colors hover:bg-blue-100">
              جلسات المدرب
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">النبذة</div>
            <div className="font-medium text-slate-800 leading-relaxed">{target.bio}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">التقييم</div>
            <div className="font-bold text-slate-800">{'5.0'} / 5.0</div>
          </div>
        </div>
      </div>
    </div>
  );
}
