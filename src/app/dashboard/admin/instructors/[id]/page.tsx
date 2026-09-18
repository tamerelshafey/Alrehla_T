import { notFound } from 'next/navigation';
import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser } from '@/data/domains/auth';
import { getInstructors } from '@/data/domains/writing';
import { getProfileUpdateRequestsByInstructor, getInstructorCertification, getPricingFormulaSettings } from '@/data/domains/writing';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { AdminInstructorClient } from './AdminInstructorClient';
import { InstructorServicesSection } from './InstructorServicesSection';
import { InstructorProfileEditor } from './InstructorProfileEditor';
import { getStandaloneServices, getInstructorServiceOffers } from '@/data/domains/services';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageInstructors')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const instructors = await getInstructors();
  const target = instructors.find(i => i.id === id);
  // مفيش سجل بالرقم ده: بنعرض صفحة «غير موجود».
  // كان مكتوب هنا «ولا هات أول واحد في القايمة» — يعني اللي بيفتح
  // رقم مش موجود كان بيشوف سجل حد تاني وهو فاكر إنه بتاعه.
  if (!target) notFound();
  const updateRequests = await getProfileUpdateRequestsByInstructor(target.id);
  const certification = await getInstructorCertification(target.id);
  const services = await getStandaloneServices({ includeInactive: true });
  const serviceOffers = await getInstructorServiceOffers(target.id);
  const formula = await getPricingFormulaSettings();

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader title={`إدارة المدرب: ${target.displayName}`} backHref="/dashboard/admin/instructors" />
      <AdminInstructorClient 
        instructor={target} 
        updateRequests={updateRequests} 
        certification={certification} 
      />
      <div className="mt-8">
        <InstructorProfileEditor instructor={target} />
      </div>
      <div className="mt-8">
        <InstructorServicesSection
          instructorId={target.id}
          services={services}
          offers={serviceOffers}
          formula={formula}
        />
      </div>
    </div>
  );
}
