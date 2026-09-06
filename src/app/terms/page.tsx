import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800">
      <div className="w-full max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 text-center">
          شروط الاستخدام
        </h1>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6">
          <p>
            مرحبًا بك في منصة الرحلة. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. شروط الاشتراك والعضوية</h3>
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li>يجب أن يتم إنشاء الحسابات وإدارتها من قبل ولي الأمر أو الوصي القانوني لمن هم دون سن 18 عامًا.</li>
            <li>أنت مسؤول عن الحفاظ على سرية بيانات الدخول الخاصة بحسابك.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. المنتجات المخصصة (إنها لك)</h3>
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li>نظرًا لطبيعة المنتجات المخصصة (التي يتم طباعتها خصيصًا لطفلك)، لا يمكن إلغاء الطلب أو استرداد المبلغ بعد مرور 24 ساعة من تأكيد الطلب.</li>
            <li>في حال وجود خطأ مطبعي أو عيب في المنتج ناتج عن المنصة، نلتزم بإعادة طباعة المنتج وإرساله مجانًا.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. برامج الكتابة الإبداعية (بداية الرحلة)</h3>
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li><strong>الالتزام بالمواعيد:</strong> يجب حضور الجلسات في موعدها المحدد. في حال الرغبة في التأجيل، يجب إبلاغنا قبل 24 ساعة على الأقل.</li>
            <li><strong>سلوك الطالب:</strong> نتوقع من جميع الطلاب الالتزام بآداب السلوك والاحترام خلال الجلسات الجماعية أو الفردية. يحق للمنصة إنهاء اشتراك أي طالب يخالف قواعد السلوك دون استرداد الرسوم.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. حقوق الملكية الفكرية</h3>
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li>جميع المحتويات الموجودة على المنصة (نصوص، رسومات، شعارات، مناهج) هي ملكية حصرية لمنصة الرحلة ومحمية بموجب قوانين حقوق النشر.</li>
            <li>يمنع نسخ أو إعادة نشر أو توزيع أي جزء من المحتوى دون إذن كتابي مسبق.</li>
            <li><strong>بالنسبة لكتابات الطلاب:</strong> يحتفظ الطالب بملكية حقوق التأليف لقصصه، وتمنح المنصة رخصة غير حصرية لعرضها في "معرض الأعمال" أو المواد التسويقية بموافقة ولي الأمر.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. التعديلات</h3>
          <p>
            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار داخل الموقع.
          </p>
          <p className="mt-8 pt-6 border-t border-slate-100">
            باستخدامك لمنصة الرحلة، فإنك توافق على هذه الشروط. لأي استفسار، يرجى زيارة <Link href="/support" className="text-amber-600 font-bold hover:underline">مركز الدعم</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
