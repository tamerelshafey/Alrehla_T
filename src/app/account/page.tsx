import Link from 'next/link';
import { Clock, PenTool } from 'lucide-react';
import { getCurrentUser } from '@/data/domains/auth';
import { fetchFamilyMembers } from '@/app/actions/family';
import { getMyServiceOrders } from '@/data/domains/services';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * The customer's account overview.
 *
 * Every number and every line of "recent activity" on this page used to be
 * written into the markup: the same greeting ("أهلاً بك، طارق!"), the same
 * 2 / 1 / 3 counts, and two invented events naming people who may not exist —
 * shown identically to every single customer.
 */
export default async function AccountOverviewPage() {
  const user = await getCurrentUser();
  const [familyMembers, serviceOrders] = await Promise.all([
    fetchFamilyMembers(),
    getMyServiceOrders(),
  ]);

  const openOrders = serviceOrders.filter(
    (o) => !['completed', 'refunded', 'cancelled'].includes(o.status)
  );
  const recent = serviceOrders.slice(0, 3);
  const firstName = (user.fullName || '').trim().split(/\s+/)[0] || '';
  return (
    <>

            {/* Greeting */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h1 className="mb-2 text-3xl font-black text-slate-800">
                {firstName ? `أهلاً بك، ${firstName}!` : 'أهلاً بك!'}
              </h1>
              <p className="text-slate-500 font-medium">هنا يمكنك إدارة جميع أنشطة وحسابات عائلتك في منصة الرحلة.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <h3 className="mb-1 font-bold text-blue-800">الطلبات النشطة</h3>
                <div className="text-3xl font-black text-blue-900">{openOrders.length}</div>
                <Link href="/account/orders/enha-lak" className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700">عرض الطلبات &larr;</Link>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
                <h3 className="mb-1 font-bold text-emerald-800">طلبات الخدمات</h3>
                <div className="text-3xl font-black text-emerald-900">{serviceOrders.length}</div>
                <Link href="/account/orders/creative-writing" className="mt-4 text-sm font-bold text-emerald-600 hover:text-emerald-700">عرض الجدول &larr;</Link>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-violet-50 p-6">
                <h3 className="mb-1 font-bold text-violet-800">أفراد العائلة</h3>
                <div className="text-3xl font-black text-violet-900">{familyMembers.length}</div>
                <Link href="/account/family" className="mt-4 text-sm font-bold text-violet-600 hover:text-violet-700">إدارة العائلة &larr;</Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 mb-6">النشاط الأخير</h2>
              {recent.length === 0 ? (
                <p className="py-8 text-center font-medium text-slate-400">
                  لا يوجد نشاط بعد.
                </p>
              ) : (
                <div className="space-y-6">
                  {recent.map((order) => (
                    <Link
                      key={order.id}
                      href={`/account/orders/creative-writing/${order.id}`}
                      className="flex items-start gap-4 rounded-2xl p-2 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <PenTool className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{order.serviceName}</h4>
                        {order.instructorName && (
                          <p className="mt-1 text-sm font-medium text-slate-500">
                            المدرب: {order.instructorName}
                          </p>
                        )}
                        <span className="mt-2 block text-xs font-bold text-slate-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

    </>
  );
}
