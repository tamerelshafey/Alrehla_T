import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { FamilyClient } from './FamilyClient';
import { fetchFamilyMembers } from '@/app/actions/family';

export default async function FamilyManagementPage() {
  const familyMembers = await fetchFamilyMembers();

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="أفراد العائلة" />
      <p className="mt-2 text-slate-500 font-medium">أضف أطفالك لإدارة حجوزاتهم وتخصيص منتجاتهم بسهولة.</p>
      
      <FamilyClient initialMembers={familyMembers} />

      {/* Helper Card */}
      <div className="mt-8 rounded-2xl bg-amber-50 p-6 border border-amber-100">
        <h4 className="font-bold text-amber-800 mb-2">كيف تعمل مسارات الأعمار؟</h4>
        <p className="text-sm font-medium text-amber-700/80 leading-relaxed">
          الأطفال دون 12 عاماً (مشارك تابع): تقوم أنت بالحجز نيابة عنهم وتدير ملفاتهم بالكامل.<br/>
          اليافعون فوق 12 عاماً (مشارك مستقل): يمكنهم امتلاك لوحة تحكم خاصة بهم لحضور الجلسات ومتابعة المهام بعد ربطهم بحسابك.
        </p>
      </div>
    </div>
  );
}
