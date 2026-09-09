import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getInstructors } from '@/data/mock';
import { getProfileUpdateRequestsByInstructor, getInstructorCertification } from '@/data/domains/writing';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { AdminInstructorClient } from './AdminInstructorClient';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageInstructors')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const instructors = await getInstructors();
  const target = instructors.find(i => i.id === id) || instructors[0];
  const updateRequests = await getProfileUpdateRequestsByInstructor(target.id);
  const certification = await getInstructorCertification(target.id);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`إدارة المدرب: ${target.displayName}`} backHref="/dashboard/admin/instructors" />
      <AdminInstructorClient 
        instructor={target} 
        updateRequests={updateRequests} 
        certification={certification} 
      />
    </div>
  );
}
