const fs = require('fs');

const writePage = (path, content) => fs.writeFileSync(path, content);

// 2. /account/orders/enha-lak/page.tsx
writePage('src/app/account/orders/enha-lak/page.tsx', `import { formatPrice } from '@/lib/utils';
import { getOrders } from '@/data/mock';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';

export default async function EnhaLakOrdersPage() {
  const allOrders = await getOrders();
  const orders = allOrders.map(order => ({
    idDisplay: \`طلب #\${order.id.replace('ord-', '').toUpperCase()}\`,
    date: new Date(order.createdAt).toLocaleDateString('ar-EG'),
    statusDisplay: <StatusBadge type={order.status === 'paid' ? 'success' : order.status === 'awaiting_verification' ? 'warning' : order.status === 'failed' ? 'danger' : order.status === 'refunded' ? 'neutral' : 'warning'} label={order.status === 'paid' ? 'مدفوع' : order.status === 'awaiting_verification' ? 'بانتظار تأكيد الدفع' : order.status === 'failed' ? 'فشل الدفع' : order.status === 'refunded' ? 'مسترجع' : 'قيد الانتظار'} />,
    total: formatPrice(order.totalAmount),
    itemsDisplay: (
      <div className="flex flex-col gap-1">
        {order.items.map((item, idx) => <span key={idx}>منتج ({item.productId}) - كمية: {item.quantity}</span>)}
      </div>
    ),
  }));

  const columns = [
    { header: 'رقم الطلب', accessorKey: 'idDisplay' },
    { header: 'التاريخ', accessorKey: 'date' },
    { header: 'الإجمالي', accessorKey: 'total' },
    { header: 'المنتجات', accessorKey: 'itemsDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="المنتجات والاشتراكات" />
      <p className="mt-2 text-slate-500 font-medium">سجل طلباتك من معرض وقصص إنها لك.</p>
      <SimpleDataTable columns={columns} data={orders} />
    </div>
  );
}
`);

// 3. /account/orders/creative-writing/page.tsx
writePage('src/app/account/orders/creative-writing/page.tsx', `import { getBookings, getServiceOrders } from '@/data/mock';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';

export default async function CreativeWritingOrdersPage() {
  const allBookings = await getBookings();
  const allServiceOrders = await getServiceOrders();
    
  const bookings = allBookings.map(b => {
    const so = allServiceOrders.find(o => o.id === b.id);
    const displayStatus = so?.status === 'awaiting_verification' ? 'awaiting_verification' : b.status;
    return {
      id: b.id,
      date: new Date(b.scheduledAt).toLocaleDateString('ar-EG'),
      time: new Date(b.scheduledAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}),
      statusDisplay: <StatusBadge type={displayStatus === 'confirmed' ? 'success' : displayStatus === 'awaiting_verification' ? 'warning' : displayStatus === 'completed' ? 'neutral' : 'warning'} label={displayStatus === 'confirmed' ? 'مؤكد' : displayStatus === 'awaiting_verification' ? 'بانتظار تأكيد الدفع' : displayStatus === 'completed' ? 'مكتمل' : 'قيد الانتظار'} />,
      instructor: 'سارة أحمد',
      studentName: 'الطالب',
      packageName: 'باقة تدريبية'
    };
  });

  const columns = [
    { header: 'الباقة', accessorKey: 'packageName' },
    { header: 'المدرب', accessorKey: 'instructor' },
    { header: 'المتدرب', accessorKey: 'studentName' },
    { header: 'التاريخ', accessorKey: 'date' },
    { header: 'الوقت', accessorKey: 'time' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="الجلسات والباقات" />
      <p className="mt-2 text-slate-500 font-medium">إدارة ومتابعة حجوزات برامج الكتابة الإبداعية.</p>
      <SimpleDataTable columns={columns} data={bookings} />
    </div>
  );
}
`);

// 4. /account/notifications/page.tsx
writePage('src/app/account/notifications/page.tsx', `import { getNotifications, getCurrentUser } from '@/data/mock';
import { redirect } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }
  const notifications = await getNotifications();
  
  const formatted = notifications.map(notif => ({
    id: notif.id,
    title: notif.title,
    message: notif.message,
    date: formatDate(notif.createdAt),
    statusDisplay: notif.isRead ? <CheckCircle2 className="h-5 w-5 text-slate-400" /> : <Circle className="h-5 w-5 text-blue-600 fill-blue-50" />
  }));

  const columns = [
    { header: '', accessorKey: 'statusDisplay' },
    { header: 'العنوان', accessorKey: 'title' },
    { header: 'التفاصيل', accessorKey: 'message' },
    { header: 'التاريخ', accessorKey: 'date' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="الإشعارات" />
      <p className="mt-2 text-slate-500 font-medium">تابع آخر التحديثات، التقييمات، وحالة طلباتك.</p>
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
`);

// 5. /account/support/page.tsx
writePage('src/app/account/support/page.tsx', `import { getMyTickets } from '@/data/mock';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

export default async function SupportPage() {
  const tickets = await getMyTickets();
  
  const formatted = tickets.map(ticket => ({
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    date: formatDate(ticket.createdAt),
    statusDisplay: <StatusBadge type={ticket.status === 'open' ? 'warning' : ticket.status === 'answered' ? 'success' : 'neutral'} label={ticket.status} />
  }));

  const columns = [
    { header: 'الموضوع', accessorKey: 'subject' },
    { header: 'القسم', accessorKey: 'category' },
    { header: 'التاريخ', accessorKey: 'date' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-blue-900 mb-1">هل تواجه مشكلة في حجز جلسة؟</h2>
          <p className="text-blue-700 text-sm">إذا كنت بحاجة للمساعدة في اختيار مدرب أو باقة، فريقنا جاهز لدعمك.</p>
        </div>
        <Link 
          href="/account/support/session-request"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 whitespace-nowrap"
        >
          <HelpCircle className="h-5 w-5" />
          طلب مساعدة في الحجز
        </Link>
      </div>

      <DashboardPageHeader title="تذاكر الدعم" action={{ label: 'تذكرة جديدة', href: '#' }} />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
`);

// 6. /account/support/session-request/page.tsx
writePage('src/app/account/support/session-request/page.tsx', `import React from 'react';
import { SessionRequestForm } from './SessionRequestForm';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

export const dynamic = 'force-dynamic';

export default function SessionRequestPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="طلب مساعدة في الحجز" backHref="/account/support" />
      <p className="text-slate-600">إذا كنت تواجه صعوبة في حجز جلسة أو اختيار الباقة المناسبة، اترك بياناتك وسنقوم بالتواصل معك لتسهيل العملية.</p>
      <SessionRequestForm />
    </div>
  );
}
`);

// 7. /account/family/page.tsx
writePage('src/app/account/family/page.tsx', `import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';

export default function FamilyManagementPage() {
  const familyMembers = [
    { id: 1, name: 'ياسمين طارق', age: 14, role: 'مشارك مستقل' },
    { id: 2, name: 'عمر طارق', age: 8, role: 'مشارك تابع' },
  ];

  const columns = [
    { header: 'الاسم', accessorKey: 'name' },
    { header: 'العمر (سنوات)', accessorKey: 'age' },
    { header: 'المسار', accessorKey: 'role' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="أفراد العائلة" action={{ label: 'إضافة فرد', href: '#' }} />
      <p className="mt-2 text-slate-500 font-medium">أضف أطفالك لإدارة حجوزاتهم وتخصيص منتجاتهم بسهولة.</p>
      
      <SimpleDataTable columns={columns} data={familyMembers} />

      {/* Helper Card */}
      <div className="mt-8 rounded-2xl bg-amber-50 p-6 border border-amber-100">
        <h4 className="font-bold text-amber-800 mb-2">كيف تعمل مسارات الأعمار؟</h4>
        <p className="text-sm font-medium text-amber-700/80 leading-relaxed">
          الأطفال دون 12 عاماً (مشارك تابع): تقوم أنت بالحجز نيابة عنهم وتدير ملفاتهم بالكامل.<br/>
          اليافعون فوق 12 عاماً (مشارك مستقل): يمكنهم امتلاك لوحة تحكم خاصة بهم لحضور الجلسات ومتابعة المهام بعد ربطهم بحسابك.
        </p>
      </div>
    </div>
  );
}
`);

// 8. /account/subscriptions/course/page.tsx
writePage('src/app/account/subscriptions/course/page.tsx', `import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';

export default function SubCoursePage() {
  const data = [
    { id: 1, name: 'مسار الإبداع التأسيسي', progress: '3 من 8' }
  ];

  const columns = [
    { header: 'الباقة', accessorKey: 'name' },
    { header: 'الجلسة الحالية', accessorKey: 'progress' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="باقات بداية الرحلة" />
      <SimpleDataTable columns={columns} data={data} />
    </div>
  );
}
`);

// 9. /account/subscriptions/box/page.tsx
writePage('src/app/account/subscriptions/box/page.tsx', `import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';

export default function SubBoxPage() {
  const data = [
    { id: 1, name: 'اشتراك 6 أشهر', date: '15 نوفمبر 2023', statusDisplay: <StatusBadge type="success" label="فعال" /> }
  ];

  const columns = [
    { header: 'نوع الاشتراك', accessorKey: 'name' },
    { header: 'تاريخ التسليم القادم', accessorKey: 'date' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="اشتراك صندوق الرحلة" action={{ label: 'إدارة الاشتراك', href: '#' }} />
      <SimpleDataTable columns={columns} data={data} />
    </div>
  );
}
`);
