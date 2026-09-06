import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800">
      <div className="w-full max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 text-center">
          سياسة الخصوصية
        </h1>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6">
          <p>
            تولي "منصة الرحلة" ("نحن"، "المنصة") أهمية قصوى لخصوصية زوارها ومشتركيها، وبشكل خاص الأطفال. تهدف هذه السياسة إلى توضيح نوع البيانات التي نجمعها، وكيفية استخدامها، وحقوقك فيما يتعلق بها.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. المعلومات التي نجمعها</h3>
          <p>نقوم بجمع المعلومات لغرضين أساسيين: تقديم خدمات مخصصة عالية الجودة، وضمان تجربة تعليمية آمنة.</p>
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li><strong>بيانات ولي الأمر:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، وعنوان الشحن.</li>
            <li><strong>بيانات الطفل (لأغراض التخصيص):</strong> الاسم الأول، العمر، الجنس، الاهتمامات.</li>
            <li><strong>الصور الشخصية:</strong> في حال طلب منتج "قصة مخصصة"، قد نطلب صورة للطفل لرسم الشخصية الرئيسية لتشبهه. يتم استخدام هذه الصور حصريًا لهذا الغرض الفني.</li>
            <li><strong>محتوى الجلسات:</strong> قد يتم تسجيل جلسات الفيديو التعليمية (في برنامج "بداية الرحلة") لأغراض ضمان الجودة، تدريب المدربين، وسلامة الأطفال.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. كيف نستخدم معلوماتك</h3>
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li><strong>تخصيص المنتجات:</strong> تأليف ورسم قصص يكون طفلك بطلها بناءً على البيانات المقدمة.</li>
            <li><strong>تنفيذ الطلبات:</strong> شحن المنتجات المطبوعة والتواصل معك بخصوص حالة الطلب.</li>
            <li><strong>تحسين الخدمة:</strong> تحليل كيفية استخدام المنصة لتطوير المحتوى والبرامج التعليمية.</li>
            <li><strong>الأمان:</strong> مراقبة الجلسات لضمان بيئة آمنة وخالية من التنمر أو المحتوى غير اللائق.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. مشاركة المعلومات</h3>
          <p>نحن لا نبيع ولا نؤجر بياناتك لأي طرف ثالث. قد نشارك بيانات محدودة مع:</p>
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li><strong>شركات الشحن:</strong> لتوصيل الطلبات.</li>
            <li><strong>المدربين:</strong> يتم مشاركة اسم الطفل وعمره واهتماماته مع المدرب المعين فقط لغرض التعليم.</li>
          </ul>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. أمن البيانات</h3>
          <p>
            نستخدم تقنيات تشفير متقدمة (SSL) لحماية بياناتك أثناء النقل والتخزين. يتم تخزين الصور والملفات الشخصية في خوادم مؤمنة ولا يتم الوصول إليها إلا من قبل الموظفين المصرح لهم.
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. حقوقك</h3>
          <p>
            لك الحق في طلب الاطلاع على بياناتك، تصحيحها، أو حذفها في أي وقت. يمكنك القيام بذلك عبر إعدادات الحساب أو التواصل مع الدعم الفني.
          </p>
          <p className="mt-8 pt-6 border-t border-slate-100">
            إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر <Link href="/support" className="text-amber-600 font-bold hover:underline">مركز الدعم</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
