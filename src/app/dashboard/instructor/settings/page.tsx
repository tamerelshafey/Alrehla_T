import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { InstructorSettingsClient } from './InstructorSettingsClient';
import { mockInstructors } from '@/data/mock';

export const dynamic = 'force-dynamic';

export default async function InstructorSettingsPage() {
  // Mock current user instructor
  const instructor = mockInstructors.find(i => i.id === 'inst-1');
  
  if (!instructor) return null;

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title="إعدادات العمل والجدول" 
        backHref="/dashboard/instructor"
      />
      
      <InstructorSettingsClient instructor={instructor} />
    </div>
  );
}
