import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { Shield, Plus, User, MoreVertical } from 'lucide-react';

export default function FamilyManagementPage() {
  const familyMembers = [
    { id: 1, name: 'ياسمين طارق', age: 14, role: 'مشارك مستقل' },
    { id: 2, name: 'عمر طارق', age: 8, role: 'مشارك تابع' },
  ];

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-7xl pt-12 pb-24">
        <div className="flex flex-col gap-8 md:flex-row">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0">
             <nav className="flex flex-col gap-2 sticky top-24">
              <Link href="/account" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <User className="h-5 w-5" />
                <span>نظرة عامة</span>
              </Link>
              <Link href="/account/family" className="flex items-center gap-3 rounded-xl bg-violet-50 text-violet-700 px-4 py-3 font-bold">
                <Shield className="h-5 w-5" />
                <span>عائلتي</span>
              </Link>
              <Link href="/account/orders/enha-lak" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <span>طلبات "إنها لك"</span>
              </Link>
              <Link href="/account/orders/creative-writing" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <span>حجوزات بداية الرحلة</span>
              </Link>
            </nav>
          </aside>

          {/* Main Area */}
          <main className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-800">أفراد العائلة</h1>
                <p className="mt-2 text-slate-500 font-medium">أضف أطفالك لإدارة حجوزاتهم وتخصيص منتجاتهم بسهولة.</p>
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-violet-700">
                <Plus className="h-5 w-5" />
                إضافة فرد
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {familyMembers.map((member) => (
                <div key={member.id} className="relative flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <button className="absolute left-4 top-4 text-slate-400 hover:text-slate-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{member.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                      <span>{member.age} سنوات</span>
                      <span>&bull;</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{member.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Helper Card */}
            <div className="mt-8 rounded-2xl bg-amber-50 p-6 border border-amber-100">
              <h4 className="font-bold text-amber-800 mb-2">كيف تعمل مسارات الأعمار؟</h4>
              <p className="text-sm font-medium text-amber-700/80 leading-relaxed">
                الأطفال دون 12 عاماً (مشارك تابع): تقوم أنت بالحجز نيابة عنهم وتدير ملفاتهم بالكامل.<br/>
                اليافعون فوق 12 عاماً (مشارك مستقل): يمكنهم امتلاك لوحة تحكم خاصة بهم لحضور الجلسات ومتابعة المهام بعد ربطهم بحسابك.
              </p>
            </div>
          </main>
        </div>
      </div>
    </PageContainer>
  );
}
