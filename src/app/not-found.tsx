import Link from 'next/link';
import { MapPinOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-24 w-full h-full min-h-[60vh] text-center">
      <div className="flex flex-col items-center gap-6 max-w-md w-full">
        <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-4">
          <MapPinOff className="w-12 h-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900">404</h1>
        <h2 className="text-2xl font-bold text-slate-800">الصفحة غير موجودة</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم تغيير الرابط أو حذفه.
        </p>
        <Link
          href="/"
          className="mt-4 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors w-full sm:w-auto"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
