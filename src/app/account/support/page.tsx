import { formatDate } from '@/lib/utils';
import { getMyTickets } from '@/data/mock';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

export default async function SupportPage() {
  const tickets = await getMyTickets();
  
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-blue-900 mb-1">هل تواجه مشكلة في حجز جلسة؟</h2>
          <p className="text-blue-700 text-sm">إذا كنت بحاجة للمساعدة في اختيار مدرب أو باقة، فريقنا جاهز لدعمك.</p>
        </div>
        <Link 
          href="/account/support/session-request" 
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 whitespace-nowrap"
        >
          <HelpCircle className="h-5 w-5" />
          طلب مساعدة في الحجز
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-900">تذاكر الدعم</h1>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
            تذكرة جديدة
          </button>
        </div>
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <p className="font-bold text-slate-800">{ticket.subject}</p>
                <p className="text-xs text-slate-500">{ticket.category} • {formatDate(ticket.createdAt)}</p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                ticket.status === 'open' ? 'bg-amber-50 text-amber-700' :
                ticket.status === 'answered' ? 'bg-emerald-50 text-emerald-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {ticket.status}
              </span>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="py-8 text-center text-slate-500">لا توجد تذاكر دعم حالية.</div>
          )}
        </div>
      </div>
    </div>
  );
}
