'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Tab {
  name: string;
  href: string;
}

interface SectionSubNavProps {
  tabs: Tab[];
  activeColorClass?: string;
}

export function SectionSubNav({
  tabs,
  activeColorClass = 'bg-sky-600 text-white',
}: SectionSubNavProps) {
  const pathname = usePathname();

  return (
    <div className="hide-scrollbar mb-6 flex w-full justify-center overflow-x-auto py-2 md:justify-start">
      <div className="flex items-center gap-2 whitespace-nowrap">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
                isActive
                  ? activeColorClass
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
