import { PageContainer } from '@/components/PageContainer';
import { AccountNav } from './AccountNav';

/**
 * إطار صفحات حساب العميل.
 *
 * القائمة الجانبية اتنقلت لـ`AccountNav` — مصدر واحد. كانت مكتوبة هنا
 * **ومكررة تاني** جوّه `page.tsx`، فصفحة «نظرة عامة» كانت بتعرض
 * قائمتين جنب بعض بأسماء مختلفة لنفس الوجهة.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer className="flex-row items-start space-y-0 gap-8 py-10">
      <aside className="w-full shrink-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:w-64">
        <AccountNav />
      </aside>

      <div className="w-full flex-1 space-y-6">{children}</div>
    </PageContainer>
  );
}
