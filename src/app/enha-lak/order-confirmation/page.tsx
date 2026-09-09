import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { CheckCircle, Package, ArrowLeft, Clock } from 'lucide-react';
import { getOrders } from '@/data/mock';

export default async function PaymentStatusPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const orders = await getOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <PageContainer>
        <div className="mx-auto w-full max-w-2xl pt-24 pb-32 text-center">
          <h1 className="mb-4 text-4xl font-black text-slate-800 md:text-5xl">طلب غير موجود</h1>
          <p className="mb-12 text-xl font-medium text-slate-500">عفواً، لم نتمكن من العثور على هذا الطلب.</p>
          <Link href="/" className="inline-block rounded-xl bg-slate-900 px-8 py-4 font-bold text-white">العودة للرئيسية</Link>
        </div>
      </PageContainer>
    );
  }

  const isAwaiting = order.status === 'awaiting_verification';

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-2xl pt-24 pb-32 text-center">
        <div className={`mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full ${isAwaiting ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
          {isAwaiting ? <Clock className="h-16 w-16" /> : <CheckCircle className="h-16 w-16" />}
        </div>
        
        <h1 className="mb-4 text-4xl font-black text-slate-800 md:text-5xl">
          {isAwaiting ? 'بانتظار تأكيد الدفع' : 'شكراً لك!'}
        </h1>
        <p className="mb-12 text-xl font-medium text-slate-500">
          {isAwaiting ? 'لقد استلمنا طلبك وجاري مراجعة إيصال الدفع. سنقوم بتأكيد طلبك قريباً.' : 'تم تأكيد طلبك بنجاح، وسنبدأ في تجهيزه على الفور.'}
        </p>
        
        <div className="mx-auto mb-12 max-w-md rounded-3xl border border-slate-100 bg-slate-50 p-8 text-right shadow-sm">
          <h2 className="mb-6 border-b border-slate-200 pb-4 text-lg font-bold text-slate-800">تفاصيل الطلب</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between font-medium text-slate-600">
              <span>رقم الطلب</span>
              <span className="font-bold text-slate-900">#{order.id.toUpperCase()}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>التاريخ</span>
              <span className="font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>الحالة</span>
              <span className={`font-bold ${isAwaiting ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isAwaiting ? 'قيد المراجعة' : 'مدفوع'}
              </span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>الإجمالي</span>
              <span className="font-bold text-amber-600">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/account/orders/enha-lak"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white shadow-md transition-colors hover:bg-slate-800"
          >
            <Package className="h-5 w-5" />
            تتبع الطلب
          </Link>
          <Link
            href="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-slate-100 px-8 py-4 font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            العودة للرئيسية
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
