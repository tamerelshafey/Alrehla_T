import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-8 md:py-12 bg-white border-t border-slate-200 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <div className="space-y-4 text-center md:text-right">
          <Link href="/" className="text-2xl font-black tracking-tighter text-amber-500 block">
            الرحلة
          </Link>
          <p className="text-sm text-slate-500 max-w-xs">
            منصة تعليمية متطورة لتعلّم الكتابة الإبداعية وتقديم قصص مخصصة.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-8">
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">روابط سريعة</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-500 font-medium">
              <Link href="/about" className="hover:text-amber-500 transition-colors">رحلتنا</Link>
              <Link href="/enha-lak" className="hover:text-amber-500 transition-colors">إنها لك</Link>
              <Link href="/creative-writing" className="hover:text-amber-500 transition-colors">بداية الرحلة</Link>
              <Link href="/blog" className="hover:text-amber-500 transition-colors">المدونة</Link>
              <Link href="/join-us" className="hover:text-amber-500 transition-colors">انضم إلينا</Link>
              <Link href="/support" className="hover:text-amber-500 transition-colors">الدعم والمساعدة</Link>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">القانونية</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-500 font-medium">
              <Link href="/privacy" className="hover:text-amber-500 transition-colors">سياسة الخصوصية</Link>
              <Link href="/terms" className="hover:text-amber-500 transition-colors">الشروط والأحكام</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
        <p>© {new Date().getFullYear()} منصة الرحلة. جميع الحقوق محفوظة.</p>
        <div className="font-mono bg-slate-50 px-2 py-1 rounded">AR - RTL Default</div>
      </div>
    </footer>
  );
}
