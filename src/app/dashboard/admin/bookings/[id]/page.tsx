import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getBookings } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageBookings')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const allBookings = await getBookings();
  const target = allBookings.find(b => b.id === id) || allBookings[0];

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`تفاصيل الحجز #${target.id.split('-')[1]}`} backHref="/dashboard/admin/bookings" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-sm text-slate-500 mb-1">الموعد</div>
            <div className="font-bold text-slate-800 text-lg">{new Date(target.scheduledAt).toLocaleString('ar-EG')}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">الحالة</div>
            <div className="font-bold text-slate-800 text-lg">{target.status}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">معرف الطالب</div>
            <div className="font-bold text-slate-800 text-lg">{target.studentId}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">معرف المدرب</div>
            <div className="font-bold text-slate-800 text-lg">{target.instructorId}</div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex gap-4">
          <Link href={`/dashboard/admin/sessions/${target.id}`} className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700">
            الدخول إلى قاعة الجلسة
          </Link>
          <button className="rounded-xl bg-red-50 px-6 py-3 font-bold text-red-600 transition-colors hover:bg-red-100">
            إلغاء الحجز
          </button>
        </div>
      </div>
    </div>
  );
}
