import { cn } from '@/lib/utils';
import React from 'react';

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex w-full flex-1 flex-col items-center justify-start space-y-24 px-6 py-20 font-sans text-slate-800 md:px-12',
        className
      )}
    >
      {children}
    </div>
  );
}
