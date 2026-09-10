import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { AdminPermission } from '@/types';
import { 
  Users, UserCheck, LayoutDashboard, Settings, 
  BookOpen, Box, ShoppingCart, Calendar, 
  LifeBuoy, FileText, DollarSign, ShieldAlert 
, LucideIcon } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (user.role !== 'super_admin' && user.role !== 'general_supervisor') {
    redirect('/dashboard');
  }

  const sidebarLinks: { label: string; href: string; icon: LucideIcon; permission: AdminPermission }[] = [
    { label: 'المستخدمون والعائلات', href: '/dashboard/admin/users', icon: Users, permission: 'canManageUsers' },
    { label: 'المدربون', href: '/dashboard/admin/instructors', icon: UserCheck, permission: 'canManageInstructors' },
    { label: 'الناشرون', href: '/dashboard/admin/publishers', icon: BookOpen, permission: 'canManagePublishers' },
    { label: 'المنتجات والمكتبة', href: '/dashboard/admin/products', icon: Box, permission: 'canManagePublishers' },
    { label: 'باقات الكتابة', href: '/dashboard/admin/writing/packages', icon: LayoutDashboard, permission: 'canManageCatalog' },
    { label: 'إعدادات تسعير الكتابة', href: '/dashboard/admin/settings/creative-writing-pricing', icon: Settings, permission: 'canManageCatalog' },
    { label: 'الاشتراكات', href: '/dashboard/admin/subscriptions/box', icon: Box, permission: 'canManageSubscriptions' },
    { label: 'الطلبات', href: '/dashboard/admin/orders', icon: ShoppingCart, permission: 'canManageOrders' },
    { label: 'الحجوزات والجلسات', href: '/dashboard/admin/bookings', icon: Calendar, permission: 'canManageBookings' },
    { label: 'طلبات الانضمام', href: '/dashboard/admin/join-requests', icon: UserCheck, permission: 'canManageSupport' },
    { label: 'رسائل الدعم الفني', href: '/dashboard/admin/support/tickets', icon: LifeBuoy, permission: 'canManageSupport' },
    { label: 'المدونة', href: '/dashboard/admin/content/blog', icon: FileText, permission: 'canManageContent' },
    { label: 'محتوى الموقع', href: '/dashboard/admin/content/pages', icon: LayoutDashboard, permission: 'canManageContent' },
    { label: 'المالية', href: '/dashboard/admin/finance/instructor-payouts', icon: DollarSign, permission: 'canManageFinance' },
    { label: 'السجلات والتدقيق', href: '/dashboard/admin/audit-logs', icon: ShieldAlert, permission: 'canViewAuditLogs' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 w-full">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-l border-slate-200 shrink-0 md:min-h-screen">
        <div className="p-6">
          <Link href="/dashboard/admin" className="text-xl font-black text-slate-800 hover:text-amber-500 transition-colors">
            لوحة الإدارة
          </Link>
        </div>
        <nav className="flex flex-col gap-1 px-4 pb-6">
          {sidebarLinks.map((link) => {
            if (!hasAdminPermission(user, link.permission)) return null;
            const Icon = link.icon;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
