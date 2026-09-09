import React from 'react';

type CardProps = {
  accentColor?: 'amber' | 'rose' | 'emerald';
  children: React.ReactNode;
  className?: string;
};

export function Card({ accentColor, children, className = '' }: CardProps) {
  const borderTopColors = {
    amber: 'border-t-amber-500',
    rose: 'border-t-rose-500',
    emerald: 'border-t-emerald-500',
  };

  const accentClass = accentColor ? `border-t-4 ${borderTopColors[accentColor]}` : '';
  
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${accentClass} ${className}`}>
      {children}
    </div>
  );
}
