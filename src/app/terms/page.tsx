import Link from 'next/link';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الشروط والأحكام',
  description: 'الشروط والأحكام الخاصة باستخدام خدمات منصة الرحلة.',
};


export default function TermsPage() {
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-start px-6 py-20 font-sans text-slate-800 md:px-12">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
        <h1 className="mb-8 text-center text-3xl font-black text-slate-900 md:text-4xl">
          شروط الاستخدام
        </h1>
        <div className="prose prose-slate max-w-none space-y-6 leading-relaxed text-slate-700">
          <p>
            مرحبًا بك في منصة الرحلة. باستخدامك لهذا الموقع، فإنك توافق على
            الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية.
          </p>

          <h3 className="mt-8 mb-4 text-xl font-bold text-slate-900">
            1. شروط الاشتراك والعضوية
          </h3>
          <ul className="mr-4 list-inside list-disc space-y-2">
            <li>
              يجب أن يتم إنشاء الحسابات وإدارتها من قبل ولي الأمر أو الوصي
              القانوني لمن هم دون سن 18 عامًا.
            </li>
            <li>أنت مسؤول عن الحفاظ على سرية بيانات الدخول الخاصة بحسابك.</li>
          </ul>

          <h3 className="mt-8 mb-4 text-xl font-bold text-slate-900">
            2. المنتجات المخصصة (إنها لك)
          </h3>
          <ul className="mr-4 list-inside list-disc space-y-2">
            <li>
              نظرًا لطبيعة المنتجات المخصصة (التي يتم طباعتها خصيصًا لطفلك)، لا
              يمكن إلغاء الطلب أو استرداد المبلغ بعد مرور 24 ساعة من تأكيد
              الطلب.
            </li>
            <li>
              في حال وجود خطأ مطبعي أو عيب في المنتج ناتج عن المنصة، نلتزم
              بإعادة طباعة المنتج وإرساله مجانًا.
            </li>
          </ul>

          <h3 className="mt-8 mb-4 text-xl font-bold text-slate-900">
            3. برامج الكتابة الإبداعية (بداية الرحلة)
          </h3>
          <ul className="mr-4 list-inside list-disc space-y-2">
            <li>
              <strong>الالتزام بالمواعيد:</strong> يجب حضور الجلسات في موعدها
              المحدد. في حال الرغبة في التأجيل، يجب إبلاغنا قبل 24 ساعة على
              الأقل.
            </li>
            <li>
              <strong>سلوك الطالب:</strong> نتوقع من جميع الطلاب الالتزام بآداب
              السلوك والاحترام خلال الجلسات الجماعية أو الفردية. يحق للمنصة
              إنهاء اشتراك أي طالب يخالف قواعد السلوك دون استرداد الرسوم.
            </li>
          </ul>

          <h3 className="mt-8 mb-4 text-xl font-bold text-slate-900">
            4. حقوق الملكية الفكرية
          </h3>
          <ul className="mr-4 list-inside list-disc space-y-2">
            <li>
              جميع المحتويات الموجودة على المنصة (نصوص، رسومات، شعارات، مناهج)
              هي ملكية حصرية لمنصة الرحلة ومحمية بموجب قوانين حقوق النشر.
            </li>
            <li>
              يمنع نسخ أو إعادة نشر أو توزيع أي جزء من المحتوى دون إذن كتابي
              مسبق.
            </li>
            <li>
              <strong>بالنسبة لكتابات الطلاب:</strong> يحتفظ الطالب بملكية حقوق
              التأليف لقصصه، وتمنح المنصة رخصة غير حصرية لعرضها في "معرض
              الأعمال" أو المواد التسويقية بموافقة ولي الأمر.
            </li>
          </ul>

          <h3 className="mt-8 mb-4 text-xl font-bold text-slate-900">
            5. التعديلات
          </h3>
          <p>
            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بأي
            تغييرات جوهرية عبر البريد الإلكتروني أو إشعار داخل الموقع.
          </p>
          <p className="mt-8 border-t border-slate-100 pt-6">
            باستخدامك لمنصة الرحلة، فإنك توافق على هذه الشروط. لأي استفسار، يرجى
            زيارة{' '}
            <Link
              href="/support"
              className="font-bold text-amber-600 hover:underline"
            >
              مركز الدعم
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
