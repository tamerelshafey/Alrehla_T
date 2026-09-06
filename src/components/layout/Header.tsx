import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-20 px-6 md:px-12 flex justify-between items-center border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <Link href="/" className="text-3xl font-black tracking-tighter text-amber-500">
          الرحلة
        </Link>
        <nav className="hidden lg:flex gap-6 text-[14px] font-bold text-slate-600">
          <Link href="/" className="hover:text-amber-500 transition-colors">الرئيسية</Link>
          <Link href="/enha-lak" className="hover:text-amber-500 transition-colors">إنها لك</Link>
          <Link href="/creative-writing" className="hover:text-amber-500 transition-colors">بداية الرحلة</Link>
          <Link href="/about" className="hover:text-amber-500 transition-colors">رحلتنا</Link>
          <Link href="/blog" className="hover:text-amber-500 transition-colors">المدونة</Link>
          <Link href="/join-us" className="hover:text-amber-500 transition-colors">انضم إلينا</Link>
          <Link href="/support" className="hover:text-amber-500 transition-colors">الدعم والمساعدة</Link>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <Link href="/cart" className="p-2 text-slate-600 hover:text-amber-500 transition-colors">
          <ShoppingCart className="w-5 h-5" />
        </Link>
        <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden sm:block"></div>
        <Link 
          href="/sign-in" 
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">دخول / حساب</span>
        </Link>
      </div>
    </header>
  );
}
