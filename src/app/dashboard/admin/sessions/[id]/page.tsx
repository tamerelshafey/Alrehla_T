import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getSessionMessages, getSessionAttachments } from '@/data/mock';
import { FileText, Download, Upload } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InstructorSessionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const messages = await getSessionMessages(sessionId);
  const attachments = await getSessionAttachments(sessionId);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title={`مساحة الجلسة`} 
        backHref="/dashboard/instructor"
        action={{ label: 'الدخول للجلسة (ميت)', href: '#' }}
      />

      <div className="grid gap-8 md:grid-cols-3">
        {/* التفاصيل والمرفقات */}
        <div className="space-y-8 md:col-span-1">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-800">معلومات الجلسة</h2>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between border-b border-slate-50 pb-3">
                <span className="text-slate-500">التاريخ والوقت</span>
                <span className="text-slate-800 font-bold">السبت، 15 أكتوبر - 4:00 م</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-3">
                <span className="text-slate-500">الباقة</span>
                <span className="text-slate-800 font-bold">باقة الإبحار</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-3">
                <span className="text-slate-500">المتدرب</span>
                <span className="text-slate-800 font-bold">ياسمين طارق</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">المرفقات</h2>
              <button className="text-blue-600 hover:text-blue-700 p-1">
                <Upload className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-5 w-5 shrink-0 text-blue-500" />
                    <span className="truncate text-sm font-bold text-slate-700">{file.fileName}</span>
                  </div>
                  <a href={file.fileUrl} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm hover:text-slate-800">
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* الرسائل المتبادلة */}
        <div className="md:col-span-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col">
            <h2 className="mb-6 text-xl font-bold text-slate-800">الرسائل والملاحظات</h2>
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 pb-4">
              {messages.map((msg) => {
                const isInstructor = msg.senderName === 'سارة أحمد';
                return (
                  <div key={msg.id} className={`flex flex-col ${isInstructor ? 'items-start' : 'items-end'}`}>
                    <div className="mb-1 text-xs font-bold text-slate-500">{msg.senderName}</div>
                    <div className={`rounded-2xl px-5 py-3 text-sm font-medium shadow-sm ${isInstructor ? 'bg-amber-100 text-amber-900 border border-amber-200 rounded-tl-none' : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tr-none'}`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex gap-2 border-t border-slate-100 pt-6">
              <input 
                type="text" 
                placeholder="أرسل ملاحظة للمتدرب..." 
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-amber-500 focus:bg-white"
              />
              <button className="rounded-xl bg-amber-500 px-6 font-bold text-white shadow-md hover:bg-amber-600">
                إرسال
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
