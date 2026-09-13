import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { InstructorSettingsClient } from './InstructorSettingsClient';
import {
  getInstructorById,
  getInstructorPricingOptions,
  getPricingFormulaSettings,
} from '@/data/domains/writing';
import { getMyInstructorId } from '@/data/domains/services';

export const dynamic = 'force-dynamic';

export default async function InstructorSettingsPage() {
  // This page used to load a hard-coded instructor ('inst-1') and fake pricing
  // data, so every instructor saw the same sample profile.
  const instructorId = await getMyInstructorId();
  if (!instructorId) return null;

  const [instructor, pricingOptions, formulaSettings] = await Promise.all([
    getInstructorById(instructorId),
    getInstructorPricingOptions(),
    getPricingFormulaSettings(),
  ]);

  if (!instructor) return null;

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader
        title="إعدادات العمل والجدول"
        backHref="/dashboard/instructor"
      />

      <InstructorSettingsClient
        instructor={instructor}
        pricingOptions={pricingOptions}
        formulaSettings={formulaSettings}
      />
    </div>
  );
}
