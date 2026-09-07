
import { getMyTickets } from '@/data/mock';

export default async function SupportPage() {
  const tickets = await getMyTickets();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">تذاكر الدعم</h1>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
          تذكرة جديدة
        </button>
      </div>
      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="font-bold text-slate-800">{ticket.subject}</p>
              <p className="text-xs text-slate-500">{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}</p>
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
      </div>
    </div>
  );
}
