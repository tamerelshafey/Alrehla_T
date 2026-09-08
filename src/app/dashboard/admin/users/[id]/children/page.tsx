import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getFamilyMembers, getAllUsers } from '@/data/mock';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageUsers')) {
    return <Unauthorized />;
  }
  
  const { id } = await params;
  const allUsers = await getAllUsers();
  const targetUser = allUsers.find(u => u.id === id) || allUsers[0];
  const children = await getFamilyMembers();

  const formattedChildren = children.map(child => ({
    ...child,
    ageDisplay: `${child.age} سنوات`
  }));

  const columns = [
    { header: 'الاسم', accessorKey: 'name' },
    { header: 'العمر', accessorKey: 'ageDisplay' },
    { header: 'الاهتمامات', accessorKey: 'interests' },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`إدارة أبناء: ${targetUser.fullName}`} backHref={`/dashboard/admin/users/${id}`} />
      
      <div className="mb-6">
        <SimpleDataTable columns={columns} data={formattedChildren} />
      </div>
    </div>
  );
}
