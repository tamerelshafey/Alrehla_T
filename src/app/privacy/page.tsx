import Link from 'next/link';
import { Metadata } from 'next';
import { PageContainer } from '@/components/PageContainer';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description: 'تعرف على سياسة الخصوصية وكيفية حماية بياناتك في منصة الرحلة.',
};


export default function PrivacyPage() {
  return (
    <PageContainer className="!py-0 !space-y-0">
      <Section containerClassName="max-w-3xl py-20">
        <Card accentColor="amber" className="p-8 shadow-sm md:p-12">
          <h1 className="mb-8 text-center text-3xl font-black text-slate-900 md:text-4xl">
            سياسة الخصوصية
          </h1>
          <div className="prose prose-slate max-w-none space-y-6 leading-relaxed text-slate-700">
            <p>
              تولي "منصة الرحلة" ("نحن"، "المنصة") أهمية قصوى لخصوصية زوارها
              ومشتركيها، وبشكل خاص الأطفال. تهدف هذه السياسة إلى توضيح نوع
              البيانات التي نجمعها، وكيفية استخدامها، وحقوقك فيما يتعلق بها.
            </p>

            <h3 className="mt-8 mb-4 text-xl font-bold text-slate-900">
              1. المعلومات التي نجمعها
            </h3>
            <p>
              نقوم بجمع المعلومات لغرضين أساسيين: تقديم خدمات مخصصة عالية الجودة،
              وضمان تجربة تعليمية آمنة.
            </p>
            <ul className="mr-4 list-inside list-disc space-y-2">
              <li>
                <strong>بيانات ولي الأمر:</strong> الاسم، البريد الإلكتروني، رقم
                الهاتف، وعنوان الشحن.
              </li>
              <li>
                <strong>بيانات الطفل (لأغراض التخصيص):</strong> الاسم الأول،
                العمر، الجنس، الاهتمامات.
              </li>
              <li>
                <strong>الصور الشخصية:</strong> في حال طلب منتج "قصة مخصصة"، قد
                نطلب صورة للطفل لرسم الشخصية الرئيسية لتشبهه. يتم استخدام هذه
                الصور حصريًا لهذا الغرض الفني.
              </li>
              <li>
                <strong>محتوى الجلسات:</strong> قد يتم تسجيل جلسات الفيديو
                التعليمية (في برنامج "بداية الرحلة") لأغراض ضمان الجودة، تدريب
                المدربين، وسلامة الأطفال.
              </li>
            </ul>

            <h3 className="mt-8 mb-4 text-xl font-bold text-slate-900">
              2. كيف نستخدم معلوماتك
            </h3>
            <ul className="mr-4 list-inside list-disc space-y-2">
              <li>
                <strong>تخصيص المنتجات:</strong> تأليف ورسم قصص يكون طفلك بطلها
                بناءً على البيانات المقدمة.
              </li>
              <li>
                <strong>تنفيذ الطلبات:</strong> شحن المنتجات المطبوعة والتواصل معك
                بخصوص حالة الطلب.
              </li>
              <li>
                <strong>تحسين الخدمة:</strong> تحليل كيفية استخدام المنصة لتطوير
                المحتوى والبرامج التعليمية.
              </li>
              <li>
                <strong>الأمان:</strong> مراقبة الجلسات لضمان بيئة آمنة وخالية من
                التنمر أو المحتوى غير اللائق.
              </li>
            </ul>

            <h3 className="mt-8 mb-4 text-xl font-bold text-slate-900">
              3. مشاركة المعلومات
            </h3>
            <p>
              نحن لا نبيع ولا نؤجر بياناتك لأي طرف ثالث. قد نشارك بيانات محدودة
              مع:
            </p>
            <ul className="mr-4 list-inside list-disc space-y-2">
              <li>
                <strong>شركات الشحن:</strong> لتوصيل الطلبات.
              </li>
              <li>
                <strong>المدربين:</strong> يتم مشاركة اسم الطفل وعمره واهتماماته
                مع المدرب المعين فقط لغرض التعليم.
              </li>
            </ul>

            <h3 className="mt-8 mb-4 text-xl font-bold text-slate-900">
              4. أمن البيانات
            </h3>
            <p>
              نستخدم تقنيات تشفير متقدمة (SSL) لحماية بياناتك أثناء النقل
              والتخزين. يتم تخزين الصور والملفات الشخصية في خوادم مؤمنة ولا يتم
              الوصول إليها إلا من قبل الموظفين المصرح لهم.
            </p>

            <h3 className="mt-8 mb-4 text-xl font-bold text-slate-900">
              5. حقوقك
            </h3>
            <p>
              لك الحق في طلب الاطلاع على بياناتك، تصحيحها، أو حذفها في أي وقت.
              يمكنك القيام بذلك عبر إعدادات الحساب أو التواصل مع الدعم الفني.
            </p>
            <p className="mt-8 border-t border-slate-100 pt-6">
              إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر{' '}
              <Link
                href="/support"
                className="font-bold text-amber-600 hover:underline"
              >
                مركز الدعم
              </Link>
              .
            </p>
          </div>
        </Card>
      </Section>
    </PageContainer>
  );
}
