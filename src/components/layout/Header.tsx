import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { cookies } from 'next/headers';

export default async function Header() {
  const cookieStore = await cookies();
  const mockRole = cookieStore.get('mockRole')?.value || 'visitor';
  const isLoggedIn = mockRole !== 'visitor';
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md md:px-12">
      <div className="flex items-center gap-10">
        <Link
          href="/"
          className="text-3xl font-black tracking-tighter text-amber-500"
        >
          الرحلة
        </Link>
        <nav className="hidden gap-6 text-[14px] font-bold text-slate-600 lg:flex">
          <Link href="/" className="transition-colors hover:text-amber-500">
            الرئيسية
          </Link>
          <Link
            href="/enha-lak"
            className="transition-colors hover:text-amber-500"
          >
            إنها لك
          </Link>
          <Link
            href="/creative-writing"
            className="transition-colors hover:text-amber-500"
          >
            بداية الرحلة
          </Link>
          <Link
            href="/about"
            className="transition-colors hover:text-amber-500"
          >
            رحلتنا
          </Link>
          <Link href="/blog" className="transition-colors hover:text-amber-500">
            المدونة
          </Link>
          <Link
            href="/join-us"
            className="transition-colors hover:text-amber-500"
          >
            انضم إلينا
          </Link>
          <Link
            href="/support"
            className="transition-colors hover:text-amber-500"
          >
            الدعم والمساعدة
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/cart"
          className="p-2 text-slate-600 transition-colors hover:text-amber-500"
        >
          <ShoppingCart className="h-5 w-5" />
        </Link>
        <div className="mx-1 hidden h-6 w-[1px] bg-slate-200 sm:block"></div>
        <Link
          href={isLoggedIn ? "/account" : "/sign-in"}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">دخول / حساب</span>
        </Link>
      </div>
    </header>
  );
}
