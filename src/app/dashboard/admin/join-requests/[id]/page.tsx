import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getJoinRequests } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageSupport')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const requests = await getJoinRequests();
  const target = requests.find(r => r.id === id) || requests[0];

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`طلب انضمام: ${target.applicantName}`} backHref="/dashboard/admin/join-requests" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-sm text-slate-500 mb-1">الدور المطلوب</div>
            <div className="font-bold text-slate-800 text-lg">{target.roleRequested === 'instructor' ? 'مدرب' : 'ناشر'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">الحالة</div>
            <div className="font-bold text-slate-800 text-lg">{target.status === 'approved' ? 'مقبول' : target.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">تاريخ التقديم</div>
            <div className="font-bold text-slate-800 text-lg">{new Date(target.submittedAt).toLocaleDateString('ar-EG')}</div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-slate-800 mb-2">نبذة عن المتقدم:</h3>
          <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            لدي خبرة تزيد عن 5 سنوات في هذا المجال وأرغب في الانضمام لفريق العمل لتقديم محتوى عالي الجودة... (نص تعبيري للنبذة المرفقة مع الطلب)
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100 flex gap-4">
          <button className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition-colors hover:bg-green-700">
            قبول الطلب
          </button>
          <button className="rounded-xl bg-red-50 px-6 py-3 font-bold text-red-600 transition-colors hover:bg-red-100">
            رفض الطلب
          </button>
        </div>
      </div>
    </div>
  );
}
