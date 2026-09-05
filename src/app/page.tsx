export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative px-6 md:px-12 py-12 min-h-screen overflow-hidden w-full font-sans text-slate-800">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[400px] bg-blue-100/30 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>
      <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          تم إعداد الأساس التقني بنجاح
        </div>
        <h1 className="text-6xl sm:text-8xl md:text-[120px] font-black leading-none tracking-tight text-slate-900 drop-shadow-sm">الرحلة</h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          منصة تعليمية متطورة لتعلّم الكتابة الإبداعية.
          <br />
          <span className="text-slate-400 text-sm md:text-base font-normal mt-2 block">Next.js 15 • TypeScript Strict • Tailwind CSS • App Router</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 transition-transform hover:scale-105">استعراض هيكل المشروع</button>
          <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors">تعديل ملف README</button>
        </div>
      </div>
    </div>
  );
}
