const fs = require('fs');
const path = require('path');

const pages = [
  { p: 'users', perm: 'canManageUsers', t: 'إدارة المستخدمين والعائلات' },
  { p: 'users/[id]', perm: 'canManageUsers', t: 'تفاصيل المستخدم' },
  { p: 'users/[id]/children', perm: 'canManageUsers', t: 'إدارة الأبناء' },
  { p: 'instructors', perm: 'canManageInstructors', t: 'إدارة المدربين' },
  { p: 'instructors/[id]', perm: 'canManageInstructors', t: 'تفاصيل المدرب' },
  { p: 'instructors/[id]/sessions', perm: 'canManageInstructors', t: 'جلسات المدرب' },
  { p: 'publishers', perm: 'canManagePublishers', t: 'إدارة الناشرين' },
  { p: 'publishers/[id]', perm: 'canManagePublishers', t: 'تفاصيل الناشر' },
  { p: 'products', perm: 'canManagePublishers', t: 'المنتجات' },
  { p: 'products/platform', perm: 'canManagePublishers', t: 'منتجات المنصة' },
  { p: 'products/[id]', perm: 'canManagePublishers', t: 'تفاصيل المنتج' },
  { p: 'writing/packages', perm: 'canManageCatalog', t: 'باقات الكتابة' },
  { p: 'writing/packages/[id]', perm: 'canManageCatalog', t: 'تفاصيل الباقة' },
  { p: 'writing/services', perm: 'canManageCatalog', t: 'خدمات الكتابة' },
  { p: 'subscriptions/box', perm: 'canManageSubscriptions', t: 'صناديق الاشتراكات' },
  { p: 'subscriptions/box/plans', perm: 'canManageSubscriptions', t: 'خطط الصناديق' },
  { p: 'subscriptions/courses', perm: 'canManageSubscriptions', t: 'اشتراكات الدورات' },
  { p: 'orders', perm: 'canManageOrders', t: 'إدارة الطلبات' },
  { p: 'orders/[id]', perm: 'canManageOrders', t: 'تفاصيل الطلب' },
  { p: 'bookings', perm: 'canManageBookings', t: 'إدارة الحجوزات' },
  { p: 'bookings/calendar', perm: 'canManageBookings', t: 'تقويم الحجوزات' },
  { p: 'bookings/[id]', perm: 'canManageBookings', t: 'تفاصيل الحجز' },
  { p: 'sessions/[id]', perm: 'canManageBookings', t: 'تفاصيل الجلسة' },
  { p: 'support/tickets', perm: 'canManageSupport', t: 'تذاكر الدعم' },
  { p: 'support/tickets/[id]', perm: 'canManageSupport', t: 'تفاصيل التذكرة' },
  { p: 'support/session-requests', perm: 'canManageSupport', t: 'طلبات الجلسات المخصصة' },
  { p: 'join-requests', perm: 'canManageSupport', t: 'طلبات الانضمام' },
  { p: 'join-requests/[id]', perm: 'canManageSupport', t: 'تفاصيل طلب الانضمام' },
  { p: 'content/blog', perm: 'canManageContent', t: 'إدارة المدونة' },
  { p: 'content/blog/[id]', perm: 'canManageContent', t: 'مقال المدونة' },
  { p: 'content/pages', perm: 'canManageContent', t: 'إدارة الصفحات' },
  { p: 'content/settings', perm: 'canManageContent', t: 'إعدادات المحتوى' },
  { p: 'finance/instructor-payouts', perm: 'canManageFinance', t: 'مستحقات المدربين' },
  { p: 'finance/publisher-payouts', perm: 'canManageFinance', t: 'مستحقات الناشرين' },
  { p: 'finance/instructor-payouts/[id]', perm: 'canManageFinance', t: 'تفاصيل مستحقات المدرب' },
  { p: 'audit-logs', perm: 'canViewAuditLogs', t: 'سجلات النظام والتدقيق' }
];

const basePath = 'src/app/dashboard/admin';

pages.forEach(({ p, perm, t }) => {
  const fullDir = path.join(basePath, p);
  fs.mkdirSync(fullDir, { recursive: true });

  const content = `import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, '${perm}')) {
    return <Unauthorized />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="${t}" />
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500 font-medium">
        قيد الإنشاء — سيُفعَّل في مرحلة قادمة
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(fullDir, 'page.tsx'), content, 'utf8');
});

console.log('Pages generated!');
