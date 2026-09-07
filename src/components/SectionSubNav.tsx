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

export function SectionSubNav({ tabs, activeColorClass = 'bg-sky-600 text-white' }: SectionSubNavProps) {
  const pathname = usePathname();

  return (
    <div className="w-full overflow-x-auto py-2 mb-6 hide-scrollbar flex justify-center md:justify-start">
      <div className="flex items-center gap-2 whitespace-nowrap">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                isActive
                  ? activeColorClass
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
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
