import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser } from '@/data/domains/auth';
import { LogoutButton } from '@/components/LogoutButton';
import { StudentProfileClient } from './StudentProfileClient';

export const dynamic = 'force-dynamic';

/**
 * The student's own profile.
 *
 * The page used to carry a "نبذة" field that had nowhere to be stored and
 * appeared nowhere on the site, pre-filled with a sentence written for them.
 * A student's profile is their name and their picture.
 */
export default async function StudentProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title="الملف الشخصي" backHref="/dashboard/student" />

      <StudentProfileClient
        fullName={user.fullName}
        email={user.email}
        avatarUrl={user.avatarUrl ?? ''}
      />

      <div className="mt-8 flex justify-end border-t border-slate-200 pt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
