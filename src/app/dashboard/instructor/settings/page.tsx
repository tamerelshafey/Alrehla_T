import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { InstructorSettingsClient } from './InstructorSettingsClient';
import { getInstructorById } from '@/data/mock';
import { mockInstructorPricingOptions, mockPricingFormulaSettings } from '@/data/domains/writing';

export const dynamic = 'force-dynamic';

export default async function InstructorSettingsPage() {
  const instructor = await getInstructorById('inst-1');
  
  if (!instructor) return null;

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title="إعدادات العمل والجدول" 
        backHref="/dashboard/instructor"
      />
      
      <InstructorSettingsClient 
        instructor={instructor} 
        pricingOptions={mockInstructorPricingOptions}
        formulaSettings={mockPricingFormulaSettings[0]}
      />
    </div>
  );
}
