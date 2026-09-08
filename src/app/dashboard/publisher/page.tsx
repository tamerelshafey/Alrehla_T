import { getCurrentUser, getPublishers, getOrders, getPersonalizedProducts } from '@/data/mock';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, ShoppingBag, Wallet, User, ListOrdered } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function PublisherDashboard() {
  const user = await getCurrentUser();
  if (user.role !== 'publisher') {
    redirect('/dashboard');
  }

  const publishers = await getPublishers();
  const myPublisher = publishers[0]; 
  const allProducts = await getPersonalizedProducts();
  const myProducts = allProducts.filter(p => p.publisherId === myPublisher.id);
  const orders = await getOrders();

  const getOrderStatus = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green-700">مكتمل الدفع</span>;
      case 'pending':
        return <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">قيد الانتظار</span>;
      default:
        return <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">لوحة الناشر</h1>
          <p className="mt-2 text-slate-500">أهلاً بك، {user.fullName} ({myPublisher.name})</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/publisher/products" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
            <Package className="h-4 w-4" /> المنتجات
          </Link>
          <Link href="/dashboard/publisher/orders" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
            <ListOrdered className="h-4 w-4" /> الطلبات
          </Link>
          <Link href="/dashboard/publisher/profile" className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
            <User className="h-4 w-4" /> الملف الشخصي
          </Link>
          <Link href="/dashboard/publisher/payouts" className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800">
            <Wallet className="h-4 w-4" /> المستحقات
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">إجمالي منتجاتي</p>
          <p className="mt-2 text-3xl font-black text-slate-800">{myProducts.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">الطلبات الواردة</p>
          <p className="mt-2 text-3xl font-black text-slate-800">{orders.length}</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Package className="h-5 w-5 text-amber-500" /> منتجاتي
            </h2>
            <Link href="/dashboard/publisher/products" className="text-sm font-bold text-blue-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-4">
            {myProducts.slice(0, 3).map(product => (
              <div key={product.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="relative h-16 w-12 overflow-hidden rounded bg-slate-200 shrink-0">
                  {product.coverImageUrl && (
                    <Image src={product.coverImageUrl} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{product.name}</h3>
                  <p className="text-sm font-bold text-amber-600">{product.price} ج.م</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <ShoppingBag className="h-5 w-5 text-blue-500" /> أحدث الطلبات
            </h2>
            <Link href="/dashboard/publisher/orders" className="text-sm font-bold text-blue-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div>
                  <div className="text-sm font-bold text-slate-800">طلب رقم #{order.id.split('-')[1]}</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="font-bold text-slate-700">{order.totalAmount} ج.م</div>
                  {getOrderStatus(order.status)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
