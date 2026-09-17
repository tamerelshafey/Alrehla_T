import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/data/domains/auth';
import { hasAdminPermission } from '@/lib/utils';
import { AdminPermission } from '@/types';
import { 
  Users, UserCheck, LayoutDashboard, Settings,
  BookOpen, Box, ShoppingCart, Calendar,
  LifeBuoy, FileText, DollarSign, ShieldAlert, Star, Truck, Quote, Package, LucideIcon 
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  
  if (user.role !== 'super_admin' && user.role !== 'general_supervisor') {
    redirect('/dashboard');
  }

  const sidebarLinks: { label: string; href: string; icon: LucideIcon; permission: AdminPermission }[] = [
    { label: 'المستخدمون والعائلات', href: '/dashboard/admin/users', icon: Users, permission: 'canManageUsers' },
    { label: 'المدربون', href: '/dashboard/admin/instructors', icon: UserCheck, permission: 'canManageInstructors' },
    // مقدّمو الخدمة: المنصة والمدربون والمستقلون. مكان واحد لتحديد
    // مين بيقدّم أي خدمة إبداعية وبكام.
    { label: 'مقدّمو الخدمة', href: '/dashboard/admin/providers', icon: UserCheck, permission: 'canManageInstructors' },
    { label: 'الناشرون', href: '/dashboard/admin/publishers', icon: BookOpen, permission: 'canManagePublishers' },
    { label: 'المنتجات والمكتبة', href: '/dashboard/admin/products', icon: Box, permission: 'canManagePublishers' },
    { label: 'إضافات المنتجات', href: '/dashboard/admin/addons', icon: Package, permission: 'canManageCatalog' },
    { label: 'باقات الكتابة', href: '/dashboard/admin/writing/packages', icon: LayoutDashboard, permission: 'canManageCatalog' },
    { label: 'الخدمات الإبداعية', href: '/dashboard/admin/writing/services', icon: LayoutDashboard, permission: 'canManageCatalog' },    
    { label: 'إعدادات تسعير الكتابة', href: '/dashboard/admin/settings/creative-writing-pricing', icon: Settings, permission: 'canManageCatalog' },
    { label: 'إعدادات تسعير الناشرين', href: '/dashboard/admin/settings/publisher-pricing', icon: Settings, permission: 'canManagePublishers' },
    { label: 'الاشتراكات', href: '/dashboard/admin/subscriptions/box', icon: Box, permission: 'canManageSubscriptions' },
    // كانت شاشة الخطط مدفونة جوّه شاشة الاشتراكات وللعرض فقط.
    { label: 'خطط صندوق الرحلة', href: '/dashboard/admin/subscriptions/box/plans', icon: Package, permission: 'canManageSubscriptions' },
    { label: 'الطلبات', href: '/dashboard/admin/orders', icon: ShoppingCart, permission: 'canManageOrders' },
    { label: 'أسعار الشحن', href: '/dashboard/admin/settings/shipping', icon: Truck, permission: 'canManageOrders' },
    { label: 'الحجوزات والجلسات', href: '/dashboard/admin/bookings', icon: Calendar, permission: 'canManageBookings' },
    { label: 'طلبات الانضمام', href: '/dashboard/admin/join-requests', icon: UserCheck, permission: 'canManageSupport' },
    { label: 'رسائل الدعم الفني', href: '/dashboard/admin/support/tickets', icon: LifeBuoy, permission: 'canManageSupport' },
    { label: 'التقييمات', href: '/dashboard/admin/reviews', icon: Star, permission: 'canManageContent' },
    { label: 'المدونة', href: '/dashboard/admin/content/blog', icon: FileText, permission: 'canManageContent' },
    { label: 'صور الموقع', href: '/dashboard/admin/content/images', icon: FileText, permission: 'canManageContent' },
    { label: 'محتوى الصفحات', href: '/dashboard/admin/content/pages', icon: LayoutDashboard, permission: 'canManageContent' },
    { label: 'آراء العملاء', href: '/dashboard/admin/content/testimonials', icon: Quote, permission: 'canManageContent' },
    // كانت شاشة الإعدادات موجودة من غير أي رابط يوصّل لها — الوصول الوحيد
    // كان بكتابة العنوان بالإيد. رقم الدفع والـ QR بيتظبطوا من هنا.
    { label: 'الإعدادات العامة', href: '/dashboard/admin/content/settings', icon: Settings, permission: 'canManageContent' },
    { label: 'المالية', href: '/dashboard/admin/finance/instructor-payouts', icon: DollarSign, permission: 'canManageFinance' },
    { label: 'طلبات السحب', href: '/dashboard/admin/finance/withdrawals', icon: DollarSign, permission: 'canManageFinance' },
    { label: 'السجلات والتدقيق', href: '/dashboard/admin/audit-logs', icon: ShieldAlert, permission: 'canViewAuditLogs' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 w-full">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-l border-slate-200 shrink-0 md:min-h-screen flex flex-col">
        <div className="p-6">
          <Link href="/dashboard/admin" className="text-xl font-black text-slate-800 hover:text-amber-500 transition-colors">
            لوحة الإدارة
          </Link>
        </div>
        <nav className="flex flex-col gap-1 px-4 flex-1">
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
        
        <div className="p-4 border-t border-slate-200">
          <LogoutButton className="w-full" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
