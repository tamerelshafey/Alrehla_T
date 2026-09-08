import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

const mockBlogPosts: any[] = [
  { id: 'post-1', title: 'كيف تشجع طفلك على القراءة', excerpt: 'نصائح هامة لتنمية مهارات القراءة لدى الأطفال في سن مبكرة...', authorName: 'إدارة المحتوى', publishedAt: '2023-10-20T10:00:00Z' as any },
  { id: 'post-2', title: 'أهمية الكتابة الإبداعية', excerpt: 'دليلك للتعرف على فوائد الكتابة الإبداعية لتطوير خيال الطفل...', authorName: 'إدارة المحتوى', publishedAt: '2023-10-25T14:30:00Z' as any },
  { id: 'post-3', title: 'إطلاق صندوق الرحلة الجديد', excerpt: 'تعرف على محتويات الإصدار الأحدث من صندوق الرحلة التعليمي...', authorName: 'إدارة المحتوى', publishedAt: '2023-11-01T09:00:00Z' as any },
];

export default async function Page() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageContent')) {
    return <Unauthorized />;
  }

  const formatted = mockBlogPosts.map(p => ({
    ...p,
    titleDisplay: <Link href={`/dashboard/admin/content/blog/${p.id}`} className="font-bold text-blue-600 hover:underline">{p.title}</Link>,
    dateDisplay: new Date(p.publishedAt).toLocaleDateString('ar-EG'),
    statusDisplay: p.status === 'published'
      ? <StatusBadge type="success" label="منشور" />
      : <StatusBadge type="neutral" label="مسودة" />
  }));

  const columns = [
    { header: 'العنوان', accessorKey: 'titleDisplay' },
    { header: 'الكاتب', accessorKey: 'authorName' },
    { header: 'تاريخ النشر', accessorKey: 'dateDisplay' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title="إدارة المدونة" />
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
