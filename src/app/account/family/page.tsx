import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';

export default function FamilyManagementPage() {
  const familyMembers = [
    { id: 1, name: 'ياسمين طارق', age: 14, role: 'مشارك مستقل' },
    { id: 2, name: 'عمر طارق', age: 8, role: 'مشارك تابع' },
  ];

  const columns = [
    { header: 'الاسم', accessorKey: 'name' },
    { header: 'العمر (سنوات)', accessorKey: 'age' },
    { header: 'المسار', accessorKey: 'role' }
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="أفراد العائلة" action={{ label: 'إضافة فرد', href: '#' }} />
      <p className="mt-2 text-slate-500 font-medium">أضف أطفالك لإدارة حجوزاتهم وتخصيص منتجاتهم بسهولة.</p>
      
      <SimpleDataTable columns={columns} data={familyMembers} />

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
