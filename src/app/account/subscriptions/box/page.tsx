
export default function SubBoxPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">اشتراك صندوق الرحلة</h1>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">اشتراك 6 أشهر (فعال)</h2>
        <p className="mt-2 text-slate-500">تاريخ التسليم القادم: 15 نوفمبر 2023</p>
        <div className="mt-6 flex items-center gap-4">
          <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600">إدارة الاشتراك</button>
        </div>
      </div>
    </div>
  );
}
