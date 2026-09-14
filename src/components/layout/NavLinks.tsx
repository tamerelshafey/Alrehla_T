'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/enha-lak', label: 'إنها لك' },
  { href: '/creative-writing', label: 'بداية الرحلة' },
  { href: '/about', label: 'رحلتنا' },
  { href: '/blog', label: 'المدونة' },
  { href: '/join-us', label: 'انضم إلينا' },
];

/**
 * روابط القائمة الرئيسية، ومعاها علامة على القسم اللي إنت فيه.
 *
 * القائمة كانت كل روابطها بنفس الشكل بالظبط، فالزائر ما يعرفش هو فين.
 * دلوقتي القسم الحالي بيتلوّن وتحته خط، **ومكتوب فيه `aria-current`**
 * عشان قارئ الشاشة يقول «الصفحة الحالية» — العلامة البصرية وحدها ما
 * بتوصلش لحد بيستخدم قارئ شاشة.
 *
 * المطابقة بالبادئة عشان الصفحات الداخلية تفضل تحت قسمها: `/enha-lak/library`
 * بيفضل مضيّي على «إنها لك». والرئيسية استثناء — بادئتها `/` بتطابق كل
 * حاجة، فبتتطابق بالتساوي بس.
 */
export function NavLinks() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="hidden gap-1 text-[14px] font-bold text-slate-600 lg:flex">
      {LINKS.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? 'relative rounded-full bg-white px-4 py-2 text-slate-900 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:outline-none'
                : 'relative rounded-full px-4 py-2 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:outline-none'
            }
          >
            {link.label}
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-amber-500"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * نفس الروابط لشاشات الموبايل — شريط أفقي يتمرّر تحت الهيدر.
 *
 * القائمة الأصلية كانت `hidden lg:flex`، يعني **مفيش قائمة خالص على
 * الموبايل ولا زرار يفتحها**. الزائر على التليفون كان يقدر يوصل للأقسام
 * من الروابط جوّه الصفحة بس.
 */
export function NavLinksMobile() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      aria-label="أقسام الموقع"
      className="mx-auto mt-2 flex max-w-7xl gap-2 overflow-x-auto px-2 pb-1 text-[13px] font-bold whitespace-nowrap text-slate-600 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {LINKS.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? 'shrink-0 rounded-full bg-slate-900 px-4 py-2 text-white shadow-sm'
                : 'shrink-0 rounded-full bg-white/70 px-4 py-2 shadow-sm backdrop-blur'
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
