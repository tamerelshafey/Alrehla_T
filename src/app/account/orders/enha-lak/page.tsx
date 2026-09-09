import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { BookOpen, Package, User, Shield, ChevronLeft, Calendar } from 'lucide-react';
import { getOrders } from '@/data/mock';
import { StatusBadge } from '@/components/StatusBadge';

export default async function EnhaLakOrdersPage() {
  const allOrders = await getOrders();
  // Filter for demo if needed, or just use them
  const orders = allOrders.map(order => ({
    id: order.id,
    date: new Date(order.createdAt).toLocaleDateString('ar-EG'),
    status: order.status,
    total: order.totalAmount,
    items: order.items.map(item => `منتج (${item.productId}) - كمية: ${item.quantity}`),
  }));
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-7xl pt-12 pb-24">
        <div className="flex flex-col gap-8 md:flex-row">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
             <nav className="flex flex-col gap-2 sticky top-24">
              <Link href="/account" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <User className="h-5 w-5" />
                <span>نظرة عامة</span>
              </Link>
              <Link href="/account/family" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <Shield className="h-5 w-5" />
                <span>عائلتي</span>
              </Link>
              <Link href="/account/orders/enha-lak" className="flex items-center gap-3 rounded-xl bg-blue-50 text-blue-700 px-4 py-3 font-bold">
                <BookOpen className="h-5 w-5" />
                <span>طلبات "إنها لك"</span>
              </Link>
              <Link href="/account/orders/creative-writing" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <span>حجوزات بداية الرحلة</span>
              </Link>
            </nav>
          </aside>

          {/* Main Area */}
          <main className="flex-1 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-800">المنتجات والاشتراكات</h1>
                <p className="mt-2 text-slate-500 font-medium">سجل طلباتك من معرض وقصص إنها لك.</p>
              </div>
            </div>

            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-800">طلب #{order.id.replace('ord-', '').toUpperCase()}</h3>
                        <StatusBadge type={order.status === 'paid' ? 'success' : order.status === 'awaiting_verification' ? 'warning' : order.status === 'failed' ? 'danger' : order.status === 'refunded' ? 'neutral' : 'warning'} label={order.status === 'paid' ? 'مدفوع' : order.status === 'awaiting_verification' ? 'بانتظار تأكيد الدفع' : order.status === 'failed' ? 'فشل الدفع' : order.status === 'refunded' ? 'مسترجع' : 'قيد الانتظار'} />
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {order.date}</span>
                        <span>الإجمالي: <strong className="text-slate-800">{order.total} ج.م</strong></span>
                      </div>
                    </div>
                    <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-6 py-3 font-bold text-slate-700 hover:bg-slate-100">
                      تفاصيل الطلب <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="pt-6">
                    <h4 className="mb-4 text-sm font-bold text-slate-500">المنتجات:</h4>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                          <Package className="h-5 w-5 text-slate-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </main>
        </div>
      </div>
    </PageContainer>
  );
}
