'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // يمكن إضافة خدمة تتبع الأخطاء هنا مستقبلاً
    // console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-24 w-full h-full min-h-[50vh] text-center">
      <div className="bg-red-50 text-red-600 p-6 rounded-3xl max-w-md w-full border border-red-100 flex flex-col items-center gap-6 shadow-sm">
        <AlertCircle className="w-12 h-12" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black">عذراً، حدث خطأ غير متوقع!</h2>
          <p className="text-red-700/80 font-medium">نعتذر عن هذا الخلل. يرجى المحاولة مرة أخرى أو العودة لاحقاً.</p>
        </div>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md hover:bg-red-700 transition-colors w-full"
        >
          حاول مرة أخرى
        </button>
      </div>
    </div>
  );
}
