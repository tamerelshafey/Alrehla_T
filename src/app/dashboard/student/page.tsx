import { getCurrentUser, getWritingPackages, getOrders } from '@/data/mock';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Book, ShoppingBag, ArrowLeft, Calendar, FileText, User, FileBox, Eye } from 'lucide-react';

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
      case 'paid':
        return (
          <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
            مكتمل الدفع
          </span>
        );
      case 'pending':
        return (
          <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
            قيد الانتظار
          </span>
        );
      default:
        return (
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-black text-slate-900">
          مرحباً، {user.fullName}
        </h1>
        <div className="flex gap-3">
          <Link href="/dashboard/student/materials" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
            <FileBox className="h-4 w-4" />
            المواد الدراسية
          </Link>
          <Link href="/dashboard/student/profile" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
            <User className="h-4 w-4" />
            الملف الشخصي
          </Link>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* رحلتي الحالية */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Book className="h-5 w-5 text-amber-500" />
              رحلتي الحالية
            </h2>
            <Link
              href="/dashboard/student/portfolio"
              className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"
            >
              ملفي الكتابي
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-lg font-bold text-slate-800">
              {currentPackage.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {currentPackage.shortDescription}
            </p>

            <div className="mt-6 mb-2 flex justify-between text-sm font-bold text-slate-600">
              <span>الجلسة 5 من 12</span>
              <span>41%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-2.5 rounded-full bg-amber-500"
                style={{ width: '41%' }}
              ></div>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <Calendar className="h-5 w-5 text-blue-500 shrink-0" />
                <span>الجلسة القادمة: السبت، 15 أكتوبر - 4:00 عصراً</span>
              </div>
              <Link 
                href="/dashboard/student/sessions/s-123" 
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <Eye className="h-4 w-4" />
                عرض التفاصيل
              </Link>
            </div>
          </div>

          <Link
            href="/creative-writing/packages"
            className="inline-block w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-center font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            استكشاف باقات أخرى
          </Link>
        </section>

        {/* طلبات إنها لك */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
              طلبات "إنها لك"
            </h2>
            <Link
              href="/enha-lak"
              className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"
            >
              المتجر
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      طلب رقم #{order.id.split('-')[1]}
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                  <div className="font-bold text-slate-700">
                    {order.totalAmount} ج.م
                  </div>
                  {getOrderStatus(order.status)}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="py-8 text-center font-medium text-slate-500">
                لا توجد طلبات سابقة.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
