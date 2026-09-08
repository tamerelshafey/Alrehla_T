import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getInstructorPayouts, getInstructors } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageFinance')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const payouts = await getInstructorPayouts();
  const target = payouts.find(p => p.id === id) || payouts[0];
  
  const instructors = await getInstructors();
  const instructor = instructors.find(i => i.id === target.instructorId);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`تفاصيل الدفعة #${target.id.split('-')[1]}`} backHref="/dashboard/admin/finance/instructor-payouts" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-sm text-slate-500 mb-1">المدرب</div>
            <div className="font-bold text-slate-800 text-lg">{instructor?.displayName || target.instructorId}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">المبلغ</div>
            <div className="font-bold text-emerald-600 text-lg">{target.amount} ج.م</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">فترة الاستحقاق</div>
            <div className="font-bold text-slate-800 text-lg">{target.period} </div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">الحالة</div>
            <div className="font-bold text-slate-800 text-lg">{target.status === 'paid' ? 'تم الدفع' : 'معلق'}</div>
          </div>
        </div>

        {target.status !== 'paid' && (
          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition-colors hover:bg-green-700">
              تعليم الدفعة كمدفوعة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
