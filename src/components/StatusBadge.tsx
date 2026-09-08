import React from 'react';

export type StatusBadgeType = 'success' | 'warning' | 'danger' | 'neutral';

interface StatusBadgeProps {
  label: React.ReactNode;
  type: StatusBadgeType;
}

export function StatusBadge({ label, type }: StatusBadgeProps) {
  const styles = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    neutral: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`rounded-md px-2 py-1 text-xs font-bold inline-block text-center whitespace-nowrap ${styles[type]}`}>
      {label}
    </span>
  );
}
