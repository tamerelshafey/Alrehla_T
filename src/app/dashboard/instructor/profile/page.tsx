import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { ProfileFormShell } from '@/components/dashboard/ProfileFormShell';
import { getCurrentUser, getInstructorById } from '@/data/mock';
import { LogoutButton } from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function InstructorProfilePage() {
  const user = await getCurrentUser();
  const instructor = await getInstructorById('inst-1');
  
  const defaultValues = {
    name: instructor?.displayName || user.fullName,
    email: user.email,
    bio: instructor?.bio || 'مدربة معتمدة في الكتابة الإبداعية.',
    avatarUrl: user.avatarUrl
  };

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title="الملف الشخصي" 
        backHref="/dashboard/instructor"
      />
      <ProfileFormShell defaultValues={defaultValues}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">سنوات الخبرة</label>
            <input 
              type="number" 
              defaultValue={instructor?.yearsExperience || 0} 
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 font-medium outline-none transition-colors focus:border-amber-500 focus:bg-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">التخصصات (مفصولة بفاصلة)</label>
            <input 
              type="text" 
              defaultValue={instructor?.specialties?.join('، ') || ''} 
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 font-medium outline-none transition-colors focus:border-amber-500 focus:bg-white" 
              placeholder="مثال: الكتابة للأطفال، بناء الشخصيات"
            />
          </div>
        </div>
      </ProfileFormShell>
      
      <div className="mt-8 flex justify-end border-t border-slate-200 pt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
