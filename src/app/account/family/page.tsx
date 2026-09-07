
import { getFamilyMembers } from '@/data/mock';

export default async function FamilyPage() {
  const family = await getFamilyMembers();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">أفراد العائلة</h1>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
          إضافة مشارك
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {family.map(member => (
          <div key={member.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
              {member.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-800">{member.name}</p>
              <p className="text-sm text-slate-500">{member.age} سنوات</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
