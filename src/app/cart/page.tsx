import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';

export default function CartPage() {
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-5xl pt-12 pb-24">
        <h1 className="mb-10 text-3xl font-black text-slate-800 md:text-5xl">سلة المشتريات</h1>
        
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
                  <Package className="h-10 w-10" />
                </div>
                <div className="flex-1 text-center md:text-right">
                  <h3 className="text-xl font-bold text-slate-800">صندوق الرحلة - اشتراك 3 أشهر</h3>
                  <p className="mt-1 font-medium text-slate-500">من الفئة العمرية: 6-9 سنوات</p>
                  <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
                    <span className="text-lg font-black text-amber-600">450 د.إ</span>
                  </div>
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-6 pt-6">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                  <Package className="h-10 w-10" />
                </div>
                <div className="flex-1 text-center md:text-right">
                  <h3 className="text-xl font-bold text-slate-800">باقة الإبحار - بداية الرحلة</h3>
                  <p className="mt-1 font-medium text-slate-500">جلسات إبداعية فردية (4 أسابيع)</p>
                  <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
                    <span className="text-lg font-black text-amber-600">800 د.إ</span>
                  </div>
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <Link href="/enha-lak" className="inline-flex items-center gap-2 font-bold text-slate-500 hover:text-slate-800">
              <ArrowRight className="h-5 w-5" />
              متابعة التسوق
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
              <h2 className="mb-6 text-xl font-black text-slate-800">ملخص الطلب</h2>
              
              <div className="space-y-4 border-b border-slate-200 pb-6">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>المجموع الفرعي</span>
                  <span>1,250 د.إ</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>الضريبة (5%)</span>
                  <span>62.5 د.إ</span>
                </div>
              </div>
              
              <div className="flex justify-between py-6 text-xl font-black text-slate-800">
                <span>الإجمالي</span>
                <span>1,312.5 د.إ</span>
              </div>
              
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-md transition-colors hover:bg-slate-800"
              >
                إتمام الطلب
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
