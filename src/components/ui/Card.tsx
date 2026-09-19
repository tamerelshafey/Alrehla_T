import React from 'react';

/**
 * البطاقة — تستهلك طبقة الرموز.
 *
 * **ولا حاجة اتغيّرت في الشكل:**
 *   rounded-3xl       → rounded-card       (1.5rem — نفس القيمة)
 *   bg-white          → bg-surface-raised  (#ffffff — نفس القيمة)
 *   border-t-amber-500 → border-t-brand    (var(--color-amber-500))
 *
 * و`accentColor` بتقبل الاسم الدلالي الجديد والاسم اللوني القديم،
 * فمفيش موضع نداء محتاج يتغيّر — زي `Button`.
 */

type Accent = 'brand' | 'enhaLak' | 'journey';
type LegacyAccent = 'amber' | 'rose' | 'emerald';

const ACCENT_ALIAS: Record<LegacyAccent, Accent> = {
  amber: 'brand',
  rose: 'enhaLak',
  emerald: 'journey',
};

type CardProps = {
  accentColor?: Accent | LegacyAccent;
  children: React.ReactNode;
  className?: string;
};

export function Card({ accentColor, children, className = '' }: CardProps) {
  const borderTopColors: Record<Accent, string> = {
    brand: 'border-t-brand',
    enhaLak: 'border-t-enha-lak',
    journey: 'border-t-journey',
  };

  const accent: Accent | undefined = accentColor
    ? accentColor in ACCENT_ALIAS
      ? ACCENT_ALIAS[accentColor as LegacyAccent]
      : (accentColor as Accent)
    : undefined;

  const accentClass = accent ? `border-t-4 ${borderTopColors[accent]}` : '';

  return (
    <div
      className={`bg-surface-raised rounded-card shadow-sm border border-slate-100 ${accentClass} ${className}`}
    >
      {children}
    </div>
  );
}
