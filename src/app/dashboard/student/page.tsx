import { getCurrentUser, getWritingPackages, getOrders } from '@/data/mock';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Book, ShoppingBag, ArrowLeft, Calendar, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  if (user.role !== 'student') {
    redirect('/dashboard');
  }

  const packages = await getWritingPackages();
  const currentPackage = packages[0];
  const orders = await getOrders();

  const getOrderStatus = (status: string) => {
    switch (status) {
      case 'paid': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">مكتمل الدفع</span>;
      case 'pending': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold">قيد الانتظار</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-slate-900 mb-8">مرحباً، {user.fullName}</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* رحلتي الحالية */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Book className="w-5 h-5 text-amber-500" />
              رحلتي الحالية
            </h2>
            <Link href="/dashboard/student/portfolio" className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
              ملفي الكتابي
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-slate-800 text-lg">{currentPackage.name}</h3>
            <p className="text-slate-500 text-sm mt-1">{currentPackage.shortDescription}</p>
            
            <div className="mt-6 mb-2 flex justify-between text-sm font-bold text-slate-600">
              <span>الجلسة 5 من 12</span>
              <span>41%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '41%' }}></div>
            </div>
            
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-600 font-medium bg-white p-3 rounded-xl border border-slate-200">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>الجلسة القادمة: السبت، 15 أكتوبر - 4:00 عصراً</span>
            </div>
          </div>
          
          <Link href="/creative-writing/packages" className="w-full inline-block text-center px-4 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-slate-300 hover:bg-slate-50 transition-colors">
            استكشاف باقات أخرى
          </Link>
        </section>

        {/* طلبات إنها لك */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
              طلبات "إنها لك"
            </h2>
            <Link href="/enha-lak" className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
              المتجر
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-50 border border-slate-100 rounded-2xl p-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">طلب رقم #{order.id.split('-')[1]}</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className="font-bold text-slate-700">{order.totalAmount} ج.م</div>
                  {getOrderStatus(order.status)}
                </div>
              </div>
            ))}
            
            {orders.length === 0 && (
              <div className="text-center py-8 text-slate-500 font-medium">
                لا توجد طلبات سابقة.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
