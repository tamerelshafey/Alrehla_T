import Link from 'next/link';
import { User, Compass } from 'lucide-react';
import React from 'react';
import { CartHeaderButton } from '@/components/cart/CartHeaderButton';
import { getCurrentUser } from '@/data/domains/auth';

export default async function Header() {
  const user = await getCurrentUser();
  const userRole = user.role;
  const isVisitor = userRole === 'visitor';

  const getAccountLink = () => {
    switch (userRole) {
      case 'visitor': return '/sign-in';
      case 'customer': return '/account';
      case 'student': return '/dashboard/student';
      case 'instructor': return '/dashboard/instructor';
      case 'publisher': return '/dashboard/publisher';
      case 'super_admin':
      case 'general_supervisor': return '/dashboard/admin';
      default: return '/sign-in';
    }
  };

  return (
    <div className="sticky top-0 z-[100] w-full px-4 pt-6 md:px-8">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-white/60 bg-white/70 px-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all md:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 flex items-center gap-2 text-2xl font-black tracking-tighter text-amber-500 hover:text-amber-600 transition-colors"
          >
            <Compass className="h-6 w-6" />
            <span>الرحلة</span>
          </Link>
          <nav className="hidden gap-1 text-[14px] font-bold text-slate-600 lg:flex">
            <NavLink href="/">الرئيسية</NavLink>
            <NavLink href="/enha-lak">إنها لك</NavLink>
            <NavLink href="/creative-writing">بداية الرحلة</NavLink>
            <NavLink href="/about">رحلتنا</NavLink>
            <NavLink href="/blog">المدونة</NavLink>
            <NavLink href="/join-us">انضم إلينا</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <CartHeaderButton />
          
          <div className="hidden h-6 w-px bg-slate-200 sm:block"></div>
          
          <Link
            href={getAccountLink()}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 flex h-10 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-bold text-white shadow-md transition-all hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-500/20"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{isVisitor ? 'دخول' : 'حسابي'}</span>
          </Link>
        </div>
      </header>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 rounded-full px-4 py-2 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm"
    >
      {children}
    </Link>
  );
}
