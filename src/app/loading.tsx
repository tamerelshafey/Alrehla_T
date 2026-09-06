export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-24 w-full h-full min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">جاري التحميل...</p>
      </div>
    </div>
  );
}
