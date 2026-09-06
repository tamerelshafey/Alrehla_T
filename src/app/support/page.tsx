'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, HelpCircle, MessageCircle, Mail, Ticket, ArrowLeft, ChevronDown } from 'lucide-react';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('enha-lak');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const tabs = [
    { id: 'enha-lak', label: 'إنها لك' },
    { id: 'creative-writing', label: 'بداية الرحلة' },
    { id: 'partners', label: 'الشركاء' },
    { id: 'general', label: 'عامة' },
  ];

  const faqs: Record<string, { q: string; a: string }[]> = {
    'enha-lak': [
      { q: 'كيف يمكنني تتبع طلبي؟', a: 'يمكنك تتبع طلبك من لوحة التحكم في قسم "مكتبتي" باستخدام رقم الطلب.' },
      { q: 'كم يستغرق شحن القصة المخصصة؟', a: 'يستغرق العمل 3-5 أيام لتجهيز وطباعة القصة، ثم 2-3 أيام إضافية للشحن حسب المحافظة.' },
      { q: 'هل يمكنني تعديل القصة بعد الطلب؟', a: 'لا يمكن التعديل بعد مرور 24 ساعة من الطلب لأن القصة تُطبع خصيصًا لطفلك بناءً على البيانات المدخلة.' },
    ],
    'creative-writing': [
      { q: 'هل يمكنني تغيير موعد الجلسة؟', a: 'نعم، يمكنك تغيير الموعد بالتنسيق مع المدرب، شرط إبلاغ الفريق قبل 24 ساعة على الأقل من موعد الجلسة لتجنب احتسابها.' },
      { q: 'ما المنصة المستخدمة للجلسات؟', a: 'نستخدم منصة Zoom في جميع جلساتنا، وستصلك روابط الدخول عبر البريد الإلكتروني.' },
      { q: 'كيف أختار المدرب؟', a: 'يمكنك استعراض ملفات المدربين من صفحة المدربين، واختيار المدرب الأنسب لك عند حجز الباقة.' },
      { q: 'ماذا يحدث إذا غبت عن الموعد؟', a: 'يتم احتساب الجلسة في حالة التغيب دون عذر مسبق يتم إبلاغنا به قبل 24 ساعة على الأقل.' },
    ],
    'partners': [
      { q: 'كيف يمكن لدار نشر أن تعرض كتبها؟', a: 'نرحب بدور النشر التي تشاركنا نفس الرؤية. يرجى إرسال تفاصيل إصداراتكم عبر نموذج التذكرة باختيار "شراكات".' },
      { q: 'كيف أقدّم عرض خدمة أو منتج كشريك؟', a: 'يمكنك تقديم عرضك عبر نموذج التواصل أسفل الصفحة، وسيقوم فريقنا بمراجعته والرد عليك.' },
      { q: 'كيف تتم مراجعة واعتماد الشركاء؟', a: 'نقوم بمراجعة جميع الطلبات للتأكد من توافق المنتجات أو الخدمات مع معايير المنصة وقيمها التربوية قبل الاعتماد.' },
    ],
    'general': [
      { q: 'ما طرق الدفع المتاحة؟', a: 'نقبل الدفع عبر البطاقات الائتمانية والمحافظ الإلكترونية وخدمات التقسيط المتاحة.' },
      { q: 'ما سياسة الاسترداد؟', a: 'يختلف الاسترداد حسب الخدمة؛ المنتجات المخصصة غير قابلة للاسترداد بعد بدء العمل، بينما يمكن استرداد بعض الخدمات قبل بدئها. يرجى مراجعة الشروط والأحكام.' },
      { q: 'كيف أدير حسابي؟', a: 'يمكنك إدارة حسابك من خلال لوحة التحكم بعد تسجيل الدخول لتحديث بياناتك أو متابعة طلباتك.' },
      { q: 'أين أجد سياسة الخصوصية؟', a: 'يمكنك العثور على سياسة الخصوصية الخاصة بنا بالضغط على الرابط في أسفل هذه الصفحة.' },
    ]
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
          كيف يمكننا مساعدتك؟
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          ابحث عن إجابتك، أو تواصل معنا إذا لم تجد ما تحتاجه.
        </p>
        <div className="relative max-w-xl mx-auto mt-8">
          <input 
            type="text" 
            placeholder="ابحث في الأسئلة: الدفع، الشحن، الجلسات، الحساب..." 
            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pr-12 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium text-slate-700 shadow-sm"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
      </section>

      {/* FAQs Section */}
      <section className="w-full max-w-4xl mx-auto">
        
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setOpenFaqIndex(null); }}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex-1 md:flex-none whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-white text-amber-600 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs[activeTab].map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200">
              <button 
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-right outline-none"
              >
                <span className="font-bold text-lg text-slate-800">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              <div 
                className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${
                  openFaqIndex === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-slate-600 font-medium leading-relaxed">{faq.a}</p>
                {faq.q.includes('الخصوصية') && (
                  <Link href="/privacy" className="text-amber-600 font-bold mt-2 inline-flex items-center gap-1 hover:underline">
                    اقرأ سياسة الخصوصية <ArrowLeft className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Contact Section */}
      <section className="w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12 text-slate-800">قنوات التواصل</h2>
        
        <div className="grid md:grid-cols-3 gap-8 items-start">
          
          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm text-center">
            <div className="w-14 h-14 mx-auto bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">واتساب</h3>
            <p className="text-slate-500 font-medium mb-6">محادثة فورية 9ص-9م</p>
            <button className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-green-600 transition-colors">
              ابدأ المحادثة
            </button>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm text-center">
            <div className="w-14 h-14 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">البريد الإلكتروني</h3>
            <p className="text-slate-500 font-medium mb-6">للشكاوى والمقترحات</p>
            <a href="mailto:support@alrehla.com" className="block w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
              support@alrehla.com
            </a>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm md:col-span-1 md:row-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">افتح تذكرة دعم</h3>
            </div>
            <p className="text-slate-500 font-medium mb-6 text-sm">لم تجد إجابة؟ أرسل لنا وسنرد خلال 24 ساعة.</p>
            
            <form className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">التصنيف</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition-all font-medium text-slate-700 text-sm">
                  <option value="enha-lak">طلب «إنها لك»</option>
                  <option value="creative-writing">«بداية الرحلة»</option>
                  <option value="account-payment">الحساب والدفع</option>
                  <option value="partners">شراكات</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">البريد الإلكتروني</label>
                <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition-all font-medium text-sm" placeholder="البريد للرد عليك" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">التفاصيل</label>
                <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition-all font-medium resize-none text-sm" placeholder="اشرح مشكلتك أو استفسارك..."></textarea>
              </div>
              <button type="button" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-colors mt-2">
                إرسال التذكرة
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* Join Us Link */}
      <div className="w-full text-center mt-12">
        <p className="text-slate-600 font-medium text-lg inline-flex items-center gap-2">
          هل ترغب في الانضمام لفريقنا؟ <Link href="/join-us" className="text-amber-600 font-bold hover:underline flex items-center gap-1">قدم طلبك هنا <ArrowLeft className="w-4 h-4" /></Link>
        </p>
      </div>

    </div>
  );
}
