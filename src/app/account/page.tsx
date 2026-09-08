import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { Settings, User, CreditCard, Clock, Star, Bell, Shield, BookOpen, PenTool } from 'lucide-react';

export default function AccountOverviewPage() {
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-7xl pt-12 pb-24">
        
        {/* Main Content Layout */}
        <div className="flex flex-col gap-8 md:flex-row">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-2 sticky top-24">
              <Link href="/account" className="flex items-center gap-3 rounded-xl bg-amber-50 text-amber-700 px-4 py-3 font-bold">
                <User className="h-5 w-5" />
                <span>نظرة عامة</span>
              </Link>
              <Link href="/account/family" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <Shield className="h-5 w-5" />
                <span>عائلتي</span>
              </Link>
              <Link href="/account/orders/enha-lak" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <BookOpen className="h-5 w-5" />
                <span>طلبات "إنها لك"</span>
              </Link>
              <Link href="/account/orders/creative-writing" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <PenTool className="h-5 w-5" />
                <span>حجوزات بداية الرحلة</span>
              </Link>
              <Link href="/account/subscriptions/box" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <Star className="h-5 w-5" />
                <span>اشتراكات الصندوق</span>
              </Link>
              <Link href="/account/support" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <Bell className="h-5 w-5" />
                <span>تذاكر الدعم</span>
              </Link>
              <Link href="/account/settings" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <Settings className="h-5 w-5" />
                <span>الإعدادات</span>
              </Link>
            </nav>
          </aside>

          {/* Main Area */}
          <main className="flex-1 space-y-8">
            {/* Greeting */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h1 className="text-3xl font-black text-slate-800 mb-2">أهلاً بك، طارق!</h1>
              <p className="text-slate-500 font-medium">هنا يمكنك إدارة جميع أنشطة وحسابات عائلتك في منصة الرحلة.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <h3 className="font-bold text-blue-800 mb-1">الطلبات النشطة</h3>
                <div className="text-3xl font-black text-blue-900">2</div>
                <Link href="/account/orders/enha-lak" className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700">عرض الطلبات &larr;</Link>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
                <h3 className="font-bold text-emerald-800 mb-1">الجلسات القادمة</h3>
                <div className="text-3xl font-black text-emerald-900">1</div>
                <Link href="/account/orders/creative-writing" className="mt-4 text-sm font-bold text-emerald-600 hover:text-emerald-700">عرض الجدول &larr;</Link>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-violet-50 p-6">
                <h3 className="font-bold text-violet-800 mb-1">أفراد العائلة</h3>
                <div className="text-3xl font-black text-violet-900">3</div>
                <Link href="/account/family" className="mt-4 text-sm font-bold text-violet-600 hover:text-violet-700">إدارة العائلة &larr;</Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 mb-6">النشاط الأخير</h2>
              <div className="space-y-6">
                
                {/* Activity Item 1 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <PenTool className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">تأكيد حجز جلسة استشارية</h4>
                    <p className="text-sm font-medium text-slate-500 mt-1">للمتدربة: ياسمين طارق | المدرب: سارة أحمد</p>
                    <span className="text-xs font-bold text-slate-400 mt-2 block">اليوم، 10:30 صباحاً</span>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">تم شحن طلب "صندوق الرحلة"</h4>
                    <p className="text-sm font-medium text-slate-500 mt-1">الطلب رقم: #ORD-9428 في طريقه إليك الآن.</p>
                    <span className="text-xs font-bold text-slate-400 mt-2 block">أمس، 04:15 مساءً</span>
                  </div>
                </div>

              </div>
            </div>

          </main>
        </div>
      </div>
    </PageContainer>
  );
}
