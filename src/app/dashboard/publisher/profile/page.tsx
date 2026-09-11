import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { ProfileFormShell } from '@/components/dashboard/ProfileFormShell';
import { getCurrentUser, getPublishers } from '@/data/mock';
import { LogoutButton } from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function PublisherProfilePage() {
  const user = await getCurrentUser();
  const publishers = await getPublishers();
  const myPublisher = publishers[0];

  const defaultValues = {
    name: myPublisher.name,
    email: user.email,
    bio: myPublisher.bio,
    avatarUrl: myPublisher.logoUrl || user.avatarUrl
  };

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title="ملف الناشر" 
        backHref="/dashboard/publisher"
      />
      <ProfileFormShell defaultValues={defaultValues} />
      
      <div className="mt-8 flex justify-end border-t border-slate-200 pt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
