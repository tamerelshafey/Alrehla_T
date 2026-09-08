import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getAllSupportTickets } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { Paperclip, Send } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageSupport')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const tickets = await getAllSupportTickets();
  const target = tickets.find(t => t.id === id) || tickets[0];

  return (
    <div className="mx-auto flex h-screen max-w-5xl flex-col px-6 py-8">
      <DashboardPageHeader title={`تذكرة #${target.id.split('-')[1]} - ${target.subject}`} backHref="/dashboard/admin/support/tickets" />
      
      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {/* User Message */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-600">
              {target.senderName?.[0] || 'U'}
            </div>
            <div className="flex flex-col gap-1 max-w-[80%]">
              <span className="text-sm font-bold text-slate-700">{target.senderName}</span>
              <div className="rounded-2xl rounded-tr-none bg-white p-4 text-slate-700 shadow-sm border border-slate-100">
                لدي مشكلة في الوصول إلى محتوى الباقة التي اشتركت بها مؤخراً، هل يمكنكم المساعدة؟
              </div>
              <span className="text-xs text-slate-400">{new Date(target.createdAt).toLocaleString('ar-EG')}</span>
            </div>
          </div>
          
          {/* Admin Reply */}
          {target.status !== 'open' && (
            <div className="flex gap-4 flex-row-reverse">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                A
              </div>
              <div className="flex flex-col gap-1 max-w-[80%] items-end">
                <span className="text-sm font-bold text-slate-700">الدعم الفني (أنت)</span>
                <div className="rounded-2xl rounded-tl-none bg-blue-600 p-4 text-white shadow-sm">
                  أهلاً بك، تم تفعيل الباقة بنجاح الآن. يمكنك التحقق من لوحة التحكم الخاصة بك. هل يوجد أي استفسار آخر؟
                </div>
                <span className="text-xs text-slate-400">الآن</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Reply Input */}
        <div className="border-t border-slate-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700">
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              type="text"
              placeholder="اكتب ردك هنا..."
              className="h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md transition-colors hover:bg-slate-800">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
