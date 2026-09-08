import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { ProfileFormShell } from '@/components/dashboard/ProfileFormShell';
import { getCurrentUser } from '@/data/mock';

export const dynamic = 'force-dynamic';

export default async function InstructorProfilePage() {
  const user = await getCurrentUser();

  const defaultValues = {
    name: 'سارة أحمد',
    email: 'sara@alrehla.com',
    bio: 'مدربة معتمدة في الكتابة الإبداعية.',
    avatarUrl: user.avatarUrl
  };

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title="الملف الشخصي" 
        backHref="/dashboard/instructor"
      />
      <ProfileFormShell defaultValues={defaultValues} />
    </div>
  );
}
