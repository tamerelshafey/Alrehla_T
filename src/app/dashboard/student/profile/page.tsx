import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { ProfileFormShell } from '@/components/dashboard/ProfileFormShell';
import { getCurrentUser } from '@/data/mock';
import { LogoutButton } from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  const defaultValues = {
    name: user.fullName,
    email: user.email,
    bio: 'طالب في برامج الكتابة الإبداعية.',
    avatarUrl: user.avatarUrl
  };

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title="الملف الشخصي" 
        backHref="/dashboard/student"
      />
      <ProfileFormShell defaultValues={defaultValues} />
      
      <div className="mt-8 flex justify-end border-t border-slate-200 pt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
