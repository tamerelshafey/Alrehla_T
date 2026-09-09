'use client';
import { formatPrice } from '@/lib/utils';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { UserProfile as UserType } from '@/types';
import { CreditCard, Wallet, MapPin, Truck, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createDummyOrder, submitPaymentProof } from '@/actions/orders';

interface Props {
  user: UserType;
}

export function CheckoutClient({ user }: Props) {
  const { items, cartTotal } = useCart();
  const [step, setStep] = useState<1 | 2>(1); // 1: Shipping, 2: Payment
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'wallet' | 'fawry' | 'instapay'>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    name: user.fullName || '',
    phone: '',
    address: '',
    city: '',
    gov: ''
  });

  const subtotal = cartTotal;
  const shipping = items.length > 0 && items.some((item: any) => item.type !== 'book') ? 50 : 0; // Fixed shipping logic for demo
  const grandTotal = subtotal + shipping;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    startTransition(async () => {
      // Create order
      const orderId = await createDummyOrder(items.map((i: any) => ({
        productId: i.id,
        quantity: i.quantity,
        unitPrice: i.price,
        customizationData: i.customizationData
      })), grandTotal);
      
      if (paymentMethod === 'instapay') {
        await submitPaymentProof(orderId, transactionRef);
      }
      
      // In real app, clearCart() would be here
      router.push('/enha-lak/order-confirmation?id=' + orderId);
    });
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-200 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">عربة التسوق فارغة</h2>
        <p className="text-slate-500 mb-8">لم تقم بإضافة أي منتجات لتتمكن من إتمام الدفع.</p>
        <Link href="/enha-lak" className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700 transition-colors">
          تصفح المتجر
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="rounded-3xl bg-white p-8 md:p-12 text-center shadow-lg border border-slate-100 max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-12 w-12" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">تم تأكيد طلبك بنجاح!</h2>
        <p className="text-slate-600 mb-2">رقم الطلب: <span className="font-bold text-slate-900">#ORD-{Math.floor(Math.random() * 100000)}</span></p>
        <p className="text-slate-600 mb-8">تم إرسال تفاصيل الطلب والفاتورة إلى بريدك الإلكتروني. يمكنك متابعة حالة الطلب من لوحة التحكم الخاصة بك.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white hover:bg-slate-800 transition-colors">
            الذهاب للوحة التحكم
          </Link>
          <Link href="/enha-lak" className="rounded-xl bg-blue-50 px-8 py-3 font-bold text-blue-700 hover:bg-blue-100 transition-colors">
            العودة للمتجر
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      {/* Forms Section */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Step 1: Shipping */}
        <div className={`rounded-3xl border ${step === 1 ? 'border-blue-200 bg-white shadow-md' : 'border-slate-200 bg-slate-50 opacity-60'} p-6 md:p-8 transition-all`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-black ${step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <h2 className="text-xl font-black text-slate-800">بيانات التوصيل</h2>
          </div>

          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">الاسم بالكامل</label>
                  <input type="text" required value={shippingInfo.name} onChange={e => setShippingInfo({...shippingInfo, name: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف</label>
                  <input type="tel" required value={shippingInfo.phone} onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})} dir="ltr" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:bg-white text-right" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">العنوان بالتفصيل (الشارع، رقم العمارة، الشقة)</label>
                <input type="text" required value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:bg-white" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">المحافظة</label>
                  <select required value={shippingInfo.gov} onChange={e => setShippingInfo({...shippingInfo, gov: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:bg-white">
                    <option value="">اختر المحافظة...</option>
                    <option value="cairo">القاهرة</option>
                    <option value="giza">الجيزة</option>
                    <option value="alex">الإسكندرية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">المدينة / المنطقة</label>
                  <input type="text" required value={shippingInfo.city} onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:bg-white" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3 font-bold text-white hover:bg-slate-800 transition-colors">
                  المتابعة للدفع <ChevronRight className="h-5 w-5 rotate-180" />
                </button>
              </div>
            </form>
          )}
          {step === 2 && (
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-bold text-slate-800">{shippingInfo.name}</p>
                  <p className="text-sm text-slate-500">{shippingInfo.address}، {shippingInfo.city}</p>
                </div>
              </div>
              <button onClick={() => setStep(1)} className="text-sm font-bold text-blue-600 hover:underline">تعديل</button>
            </div>
          )}
        </div>

        {/* Step 2: Payment */}
        <div className={`rounded-3xl border ${step === 2 ? 'border-blue-200 bg-white shadow-md' : 'border-slate-200 bg-white opacity-50 pointer-events-none'} p-6 md:p-8 transition-all`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-black ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
            <h2 className="text-xl font-black text-slate-800">طريقة الدفع</h2>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <label className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-colors ${paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} className="sr-only" />
                <CreditCard className={`h-8 w-8 ${paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="font-bold text-sm">بطاقة بنكية</span>
              </label>

              <label className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-colors ${paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                <input type="radio" name="payment" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="sr-only" />
                <Wallet className={`h-8 w-8 ${paymentMethod === 'wallet' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="font-bold text-sm text-center">محفظة إلكترونية<br/><span className="text-xs font-normal opacity-70">(فودافون كاش وغيرها)</span></span>
              </label>

              <label className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-colors ${paymentMethod === 'fawry' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                <input type="radio" name="payment" value="fawry" checked={paymentMethod === 'fawry'} onChange={() => setPaymentMethod('fawry')} className="sr-only" />
                <div className="h-8 flex items-center justify-center font-black text-lg tracking-wider" style={{color: paymentMethod === 'fawry' ? '#facc15' : '#94a3b8'}}>fawry</div>
                <span className="font-bold text-sm">كود فوري</span>
              </label>

            
              <label className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-colors ${paymentMethod === 'instapay' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                <input type="radio" name="payment" value="instapay" checked={paymentMethod === 'instapay'} onChange={() => setPaymentMethod('instapay')} className="sr-only" />
                <div className="h-8 flex items-center justify-center font-black text-lg tracking-wider" style={{color: paymentMethod === 'instapay' ? '#8a2be2' : '#94a3b8'}}>InstaPay</div>
                <span className="font-bold text-sm">إنستاباي</span>
              </label>

            </div>

            {paymentMethod === 'credit_card' && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم البطاقة</label>
                  <input type="text" required placeholder="0000 0000 0000 0000" dir="ltr" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ الانتهاء</label>
                    <input type="text" required placeholder="MM/YY" dir="ltr" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 font-mono text-center" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">الرقم السري (CVV)</label>
                    <input type="text" required placeholder="123" dir="ltr" maxLength={4} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 font-mono text-center" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>معلوماتك البنكية مشفرة وآمنة 100%. نحن لا نحتفظ ببيانات بطاقتك.</span>
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف المرتبط بالمحفظة الإلكترونية</label>
                <input type="tel" required placeholder="01X XXXX XXXX" dir="ltr" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 font-mono text-right" />
                <p className="text-xs text-slate-500 mt-2">ستصلك رسالة لتأكيد الدفع على هذا الرقم.</p>
              </div>
            )}

            {paymentMethod === 'fawry' && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-bold text-slate-700 mb-2">كيف يعمل الدفع بفوري؟</p>
                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                  <li>بعد تأكيد الطلب، سيظهر لك "كود دفع فوري".</li>
                  <li>توجه لأقرب منفذ فوري أو استخدم تطبيق myFawry.</li>
                  <li>أدخل الكود وقم بالدفع خلال 24 ساعة لتأكيد طلبك.</li>
                </ol>
              </div>
            )}

            {paymentMethod === 'instapay' && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-bold text-slate-700 mb-2">تعليمات الدفع عبر إنستاباي</p>
                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-slate-600 mb-2">قم بتحويل المبلغ إلى رقم المحفظة التالي:</p>
                  <p className="text-xl font-mono font-black text-blue-700 select-all">01234567890</p>
                </div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رقم العملية / المرجع (Transaction Reference)</label>
                <input type="text" required value={transactionRef} onChange={e => setTransactionRef(e.target.value)} placeholder="رقم العملية أو المرجع" dir="ltr" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 font-mono text-right" />
              </div>
            )}

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-black text-white hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-70"
              >
                {isPending || isProcessing ? (paymentMethod === 'instapay' ? 'جاري التحقق وإرسال الطلب...' : 'جاري معالجة الدفع...') : (paymentMethod === 'instapay' ? 'لقد قمت بالتحويل' : `تأكيد الدفع (${formatPrice(grandTotal)})`)}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Order Summary Sidebar */}
      <div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-8">
          <h3 className="text-lg font-black text-slate-800 mb-6">ملخص الطلب</h3>
          
          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item: any) => (
              <div key={item.id} className="flex gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                  <Image src={item.imageUrl || ''} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-2">{item.name}</h4>
                  {item.customizationData?.childName && (
                    <p className="text-xs text-slate-500 mt-1">الطفل: {item.customizationData.childName}</p>
                  )}

                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-slate-500">الكمية: {item.quantity}</span>
                    <span className="text-sm font-bold text-blue-600">{formatPrice((item.price * item.quantity))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 py-4 border-y border-slate-100 mb-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>المجموع الفرعي</span>
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>مصاريف الشحن</span>
              <span className="font-bold">{shipping === 0 ? 'مجاناً' : `${formatPrice(shipping)}`}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-black text-slate-800">الإجمالي</span>
            <span className="text-2xl font-black text-blue-600">{formatPrice(grandTotal)}</span>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              تسوق آمن ومحمي. جميع بياناتك مشفرة وفقاً لمعايير الأمان العالمية.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
