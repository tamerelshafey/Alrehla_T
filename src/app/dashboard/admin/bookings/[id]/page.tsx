import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getBookings, getServiceOrders } from '@/data/mock';
import { hasAdminPermission, formatDate } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import Link from 'next/link';
import { confirmBookingPayment } from '@/actions/bookings';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageBookings')) {
    return <Unauthorized />;
  }
  const { id } = await params;
  const allBookings = await getBookings();
  const target = allBookings.find(b => b.id === id) || allBookings[0];
  
  const allServiceOrders = await getServiceOrders();
  const serviceOrder = allServiceOrders.find(so => so.id === target.id); // Assuming 1:1 mapping by ID for now based on dummy logic

  const confirmPaymentAction = async () => {
    'use server';
    await confirmBookingPayment(target.id);
  };

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`تفاصيل الحجز #${target.id.split('-')[1]}`} backHref="/dashboard/admin/bookings" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-sm text-slate-500 mb-1">الموعد</div>
            <div className="font-bold text-slate-800 text-lg">{formatDate(target.scheduledAt)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">حالة الحجز</div>
            <div className="font-bold text-slate-800 text-lg">{target.status === 'confirmed' ? 'مؤكد' : target.status === 'pending' ? 'قيد الانتظار' : target.status}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">معرف الطالب</div>
            <div className="font-bold text-slate-800 text-lg">{target?.userId}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">معرف المدرب</div>
            <div className="font-bold text-slate-800 text-lg">{target.instructorId}</div>
          </div>
          
          {serviceOrder && (
            <div className="col-span-1 md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-sm text-slate-500 mb-1">بيانات الدفع (الطلب #{serviceOrder.id})</div>
              <div className="font-bold text-slate-800">حالة الدفع: {serviceOrder.status === 'awaiting_verification' ? 'بانتظار تأكيد الدفع' : serviceOrder.status === 'paid' ? 'مدفوع' : serviceOrder.status}</div>
              {serviceOrder.transactionReference && (
                <div className="text-sm text-blue-600 font-mono mt-1">المرجع: {serviceOrder.transactionReference}</div>
              )}
              {serviceOrder.status === 'awaiting_verification' && (
                <form action={confirmPaymentAction} className="mt-4">
                  <button type="submit" className="rounded-xl bg-emerald-600 px-6 py-2 font-bold text-white transition-colors hover:bg-emerald-700">
                    تأكيد استلام الدفع
                  </button>
                </form>
              )}
            </div>
          )}
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
