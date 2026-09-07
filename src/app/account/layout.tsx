
import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { Users, ShoppingBag, Calendar, Package, HelpCircle, Bell, User } from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer className="flex-row items-start space-y-0 gap-8 py-10">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <nav className="space-y-1">
          <Link href="/account" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <User className="h-4 w-4" /> نظرة عامة
          </Link>
          <Link href="/account/family" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <Users className="h-4 w-4" /> أفراد العائلة
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-bold tracking-wider text-slate-400 uppercase">الطلبات والمواعيد</p>
          </div>
          <Link href="/account/orders/enha-lak" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <ShoppingBag className="h-4 w-4" /> طلبات إنها لك
          </Link>
          <Link href="/account/bookings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <Calendar className="h-4 w-4" /> المواعيد والجلسات
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-bold tracking-wider text-slate-400 uppercase">الاشتراكات</p>
          </div>
          <Link href="/account/subscriptions/box" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <Package className="h-4 w-4" /> صندوق الرحلة
          </Link>
          <Link href="/account/subscriptions/course" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <Package className="h-4 w-4" /> باقات بداية الرحلة
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-bold tracking-wider text-slate-400 uppercase">أخرى</p>
          </div>
          <Link href="/account/support" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <HelpCircle className="h-4 w-4" /> تذاكر الدعم
          </Link>
          <Link href="/account/notifications" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-amber-600">
            <Bell className="h-4 w-4" /> الإشعارات
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full space-y-6">
        {children}
      </div>
    </PageContainer>
  );
}
