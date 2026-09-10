
export default function SubCoursePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">باقات بداية الرحلة</h1>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">مسار الإبداع التأسيسي</h2>
        <p className="mt-2 text-slate-500">الجلسة الحالية: 3 من 8</p>
        <div className="mt-6 w-full rounded-full bg-slate-100 h-2">
          <div className="bg-amber-500 h-2 rounded-full" style={{ width: '37.5%' }}></div>
        </div>
      </div>
    </div>
  );
}
