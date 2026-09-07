import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { CheckCircle, Package, ArrowLeft } from 'lucide-react';

export default function PaymentStatusPage() {
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-2xl pt-24 pb-32 text-center">
        <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle className="h-16 w-16" />
        </div>
        
        <h1 className="mb-4 text-4xl font-black text-slate-800 md:text-5xl">شكراً لك!</h1>
        <p className="mb-12 text-xl font-medium text-slate-500">تم تأكيد طلبك بنجاح، وسنبدأ في تجهيزه على الفور.</p>
        
        <div className="mx-auto mb-12 max-w-md rounded-3xl border border-slate-100 bg-slate-50 p-8 text-right shadow-sm">
          <h2 className="mb-6 border-b border-slate-200 pb-4 text-lg font-bold text-slate-800">تفاصيل الطلب</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between font-medium text-slate-600">
              <span>رقم الطلب</span>
              <span className="font-bold text-slate-900">#ORD-9428</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>التاريخ</span>
              <span className="font-bold text-slate-900">{new Date().toLocaleDateString('ar-EG')}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>طريقة الدفع</span>
              <span className="font-bold text-slate-900">بطاقة ائتمانية</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>الإجمالي</span>
              <span className="font-bold text-amber-600">1,312.5 د.إ</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/account"
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
