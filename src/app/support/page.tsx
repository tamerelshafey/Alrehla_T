

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import {



  Search,
  MessageCircle,
  Mail,
  Ticket,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';

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
      {
        q: 'كيف يمكنني تتبع طلبي؟',
        a: 'يمكنك تتبع طلبك من لوحة التحكم في قسم "مكتبتي" باستخدام رقم الطلب.',
      },
      {
        q: 'كم يستغرق شحن القصة المخصصة؟',
        a: 'يستغرق العمل 3-5 أيام لتجهيز وطباعة القصة، ثم 2-3 أيام إضافية للشحن حسب المحافظة.',
      },
      {
        q: 'هل يمكنني تعديل القصة بعد الطلب؟',
        a: 'لا يمكن التعديل بعد مرور 24 ساعة من الطلب لأن القصة تُطبع خصيصًا لطفلك بناءً على البيانات المدخلة.',
      },
    ],
    'creative-writing': [
      {
        q: 'هل يمكنني تغيير موعد الجلسة؟',
        a: 'نعم، يمكنك تغيير الموعد بالتنسيق مع المدرب، شرط إبلاغ الفريق قبل 24 ساعة على الأقل من موعد الجلسة لتجنب احتسابها.',
      },
      {
        q: 'ما المنصة المستخدمة للجلسات؟',
        a: 'نستخدم منصة Zoom في جميع جلساتنا، وستصلك روابط الدخول عبر البريد الإلكتروني.',
      },
      {
        q: 'كيف أختار المدرب؟',
        a: 'يمكنك استعراض ملفات المدربين من صفحة المدربين، واختيار المدرب الأنسب لك عند حجز الباقة.',
      },
      {
        q: 'ماذا يحدث إذا غبت عن الموعد؟',
        a: 'يتم احتساب الجلسة في حالة التغيب دون عذر مسبق يتم إبلاغنا به قبل 24 ساعة على الأقل.',
      },
    ],
    partners: [
      {
        q: 'كيف يمكن لدار نشر أن تعرض كتبها؟',
        a: 'نرحب بدور النشر التي تشاركنا نفس الرؤية. يرجى إرسال تفاصيل إصداراتكم عبر نموذج التذكرة باختيار "شراكات".',
      },
      {
        q: 'كيف أقدّم عرض خدمة أو منتج كشريك؟',
        a: 'يمكنك تقديم عرضك عبر نموذج التواصل أسفل الصفحة، وسيقوم فريقنا بمراجعته والرد عليك.',
      },
      {
        q: 'كيف تتم مراجعة واعتماد الشركاء؟',
        a: 'نقوم بمراجعة جميع الطلبات للتأكد من توافق المنتجات أو الخدمات مع معايير المنصة وقيمها التربوية قبل الاعتماد.',
      },
    ],
    general: [
      {
        q: 'ما طرق الدفع المتاحة؟',
        a: 'نقبل الدفع عبر البطاقات الائتمانية والمحافظ الإلكترونية وخدمات التقسيط المتاحة.',
      },
      {
        q: 'ما سياسة الاسترداد؟',
        a: 'يختلف الاسترداد حسب الخدمة؛ المنتجات المخصصة غير قابلة للاسترداد بعد بدء العمل، بينما يمكن استرداد بعض الخدمات قبل بدئها. يرجى مراجعة الشروط والأحكام.',
      },
      {
        q: 'كيف أدير حسابي؟',
        a: 'يمكنك إدارة حسابك من خلال لوحة التحكم بعد تسجيل الدخول لتحديث بياناتك أو متابعة طلباتك.',
      },
      {
        q: 'أين أجد سياسة الخصوصية؟',
        a: 'يمكنك العثور على سياسة الخصوصية الخاصة بنا بالضغط على الرابط في أسفل هذه الصفحة.',
      },
    ],
  };

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl space-y-6 text-center">
        <h1 className="text-4xl leading-tight font-black text-slate-900 md:text-6xl">
          كيف يمكننا مساعدتك؟
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
          ابحث عن إجابتك، أو تواصل معنا إذا لم تجد ما تحتاجه.
        </p>
        <div className="relative mx-auto mt-8 max-w-xl">
          <input
            type="text"
            placeholder="ابحث في الأسئلة: الدفع، الشحن، الجلسات، الحساب..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-4 pr-12 font-medium text-slate-700 shadow-sm transition-all outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <Search className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
        </div>
      </section>

      {/* FAQs Section */}
      <section className="mx-auto w-full max-w-4xl">
        {/* Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setOpenFaqIndex(null);
              }}
              className={`flex-1 rounded-xl px-6 py-3 text-sm font-bold whitespace-nowrap transition-all md:flex-none ${
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
            <div
              key={idx}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200"
            >
              <button
                onClick={() =>
                  setOpenFaqIndex(openFaqIndex === idx ? null : idx)
                }
                className="flex w-full items-center justify-between p-6 text-right outline-none"
              >
                <span className="text-lg font-bold text-slate-800">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className={`overflow-hidden px-6 transition-all duration-300 ease-in-out ${
                  openFaqIndex === idx
                    ? 'max-h-40 pb-6 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <p className="leading-relaxed font-medium text-slate-600">
                  {faq.a}
                </p>
                {faq.q.includes('الخصوصية') && (
                  <Link
                    href="/privacy"
                    className="mt-2 inline-flex items-center gap-1 font-bold text-amber-600 hover:underline"
                  >
                    اقرأ سياسة الخصوصية <ArrowLeft className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="mx-auto w-full max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-black text-slate-800">
          قنوات التواصل
        </h2>

        <div className="grid items-start gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">واتساب</h3>
            <p className="mb-6 font-medium text-slate-500">
              محادثة فورية 9ص-9م
            </p>
            <button className="w-full rounded-xl bg-green-500 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-green-600">
              ابدأ المحادثة
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">
              البريد الإلكتروني
            </h3>
            <p className="mb-6 font-medium text-slate-500">
              للشكاوى والمقترحات
            </p>
            <a
              href="mailto:support@alrehla.com"
              className="block w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              support@alrehla.com
            </a>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:col-span-1 md:row-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Ticket className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                افتح تذكرة دعم
              </h3>
            </div>
            <p className="mb-6 text-sm font-medium text-slate-500">
              لم تجد إجابة؟ أرسل لنا وسنرد خلال 24 ساعة.
            </p>

            <form className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  التصنيف
                </label>
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all outline-none focus:border-amber-500">
                  <option value="enha-lak">طلب «إنها لك»</option>
                  <option value="creative-writing">«بداية الرحلة»</option>
                  <option value="account-payment">الحساب والدفع</option>
                  <option value="partners">شراكات</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium transition-all outline-none focus:border-amber-500"
                  placeholder="البريد للرد عليك"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  التفاصيل
                </label>
                <textarea
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium transition-all outline-none focus:border-amber-500"
                  placeholder="اشرح مشكلتك أو استفسارك..."
                ></textarea>
              </div>
              <button
                type="button"
                className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800"
              >
                إرسال التذكرة
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Join Us Link */}
      <div className="mt-12 w-full text-center">
        <p className="inline-flex items-center gap-2 text-lg font-medium text-slate-600">
          هل ترغب في الانضمام لفريقنا؟{' '}
          <Link
            href="/join-us"
            className="flex items-center gap-1 font-bold text-amber-600 hover:underline"
          >
            قدم طلبك هنا <ArrowLeft className="h-4 w-4" />
          </Link>
        </p>
      </div>
    </PageContainer>
  );
}
