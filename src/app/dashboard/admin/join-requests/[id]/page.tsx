import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getJoinRequests } from '@/data/mock';
import { hasAdminPermission, formatDate } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { User, Mail, Phone, Calendar, Briefcase, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

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
      
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-50 border-b border-slate-200 p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm text-amber-600 text-2xl font-black">
              {target.applicantName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">{target.applicantName}</h2>
              <div className="flex items-center gap-2 mt-1 text-slate-500 font-medium">
                <Briefcase className="h-4 w-4" />
                {target.requestedRole === 'instructor' ? 'طلب انضمام كمدرب' : 'طلب انضمام كناشر'}
              </div>
            </div>
          </div>
          <div>
            <StatusBadge 
              type={target.status === 'approved' ? 'success' : target.status === 'rejected' ? 'danger' : 'warning'} 
              label={target.status === 'approved' ? 'مقبول' : target.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm text-slate-500 mb-1">البريد الإلكتروني</div>
                <div className="font-bold text-slate-800">applicant@example.com</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm text-slate-500 mb-1">رقم الهاتف</div>
                <div className="font-bold text-slate-800">+20 100 123 4567</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm text-slate-500 mb-1">تاريخ التقديم</div>
                <div className="font-bold text-slate-800">{formatDate(target.createdAt)}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              نبذة عن المتقدم
            </h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed">
              لدي خبرة تزيد عن 5 سنوات في هذا المجال وأرغب في الانضمام لفريق العمل لتقديم محتوى عالي الجودة. عملت سابقاً مع عدة منصات تعليمية ولدي شغف كبير بالكتابة الإبداعية وتطوير مهارات الطلاب.
              أتمنى أن تتاح لي الفرصة لكي أكون جزءاً من منصة الرحلة.
            </div>
          </div>
          
          {target.requestedRole === 'instructor' && (
            <div className="border-t border-slate-100 pt-8">
              <h3 className="font-bold text-slate-800 mb-4">روابط النماذج السابقة (Portfolio)</h3>
              <ul className="list-disc list-inside text-blue-600 hover:underline cursor-pointer space-y-2">
                <li>https://example.com/portfolio/work1</li>
                <li>https://example.com/portfolio/work2</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-8 border-t border-slate-100 flex flex-wrap gap-4">
            {target.status === 'pending' ? (
              <>
                <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-emerald-700">
                  <CheckCircle className="h-5 w-5" />
                  قبول الطلب
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-rose-50 px-6 py-3 font-bold text-rose-600 transition-colors hover:bg-rose-100">
                  <XCircle className="h-5 w-5" />
                  رفض الطلب
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                <Clock className="h-5 w-5" />
                تم اتخاذ إجراء مسبقاً على هذا الطلب
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
