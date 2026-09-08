'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PageContainer } from '@/components/PageContainer';
import { ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartClient() {
  const { items, removeItem, updateQuantity, cartTotal } = useCart();
  
  const tax = cartTotal * 0.05;
  const total = cartTotal + tax;

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-5xl pt-12 pb-24">
        <h1 className="mb-10 text-3xl font-black text-slate-800 md:text-5xl">سلة المشتريات</h1>
        
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <ShoppingCart className="h-10 w-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">سلتك فارغة</h3>
                  <p className="mt-2 text-slate-500">تصفح المكتبة وأضف بعض القصص الممتعة!</p>
                  <Link href="/enha-lak" className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3 font-bold text-white hover:bg-slate-800">
                    تصفح المنتجات
                  </Link>
                </div>
              ) : (
                <div className="space-y-6 divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <div key={item.id} className={`flex flex-col md:flex-row items-center gap-6 ${index > 0 ? 'pt-6' : 'pb-6 border-b border-slate-100'}`}>
                      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-400">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        ) : (
                          <Package className="h-10 w-10" />
                        )}
                      </div>
                      <div className="flex-1 text-center md:text-right">
                        <h3 className="text-xl font-bold text-slate-800">{item.name}</h3>
                        <p className="mt-1 font-medium text-slate-500">الكمية: {item.quantity}</p>
                        <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
                          <span className="text-lg font-black text-emerald-600">{item.price.toLocaleString('ar-EG')} ج.م</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Link href="/enha-lak" className="inline-flex items-center gap-2 font-bold text-slate-500 hover:text-slate-800">
              <ArrowRight className="h-5 w-5" />
              متابعة التسوق
            </Link>
          </div>

          {/* Order Summary */}
          {items.length > 0 && (
            <div className="lg:col-span-1">
              <div className="sticky top-32 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
                <h2 className="mb-6 text-xl font-black text-slate-800">ملخص الطلب</h2>
                
                <div className="space-y-4 border-b border-slate-200 pb-6">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>المجموع الفرعي</span>
                    <span>{cartTotal.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>الضريبة (5%)</span>
                    <span>{tax.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>
                
                <div className="flex justify-between py-6 text-xl font-black text-slate-800">
                  <span>الإجمالي</span>
                  <span>{total.toLocaleString('ar-EG')} ج.م</span>
                </div>
                
                <Link
                  href="/enha-lak/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-md transition-colors hover:bg-slate-800"
                >
                  إتمام الطلب
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
