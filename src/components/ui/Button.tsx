import React from 'react';
import Link from 'next/link';

/**
 * الزر — أول مكوّن بيستهلك طبقة الرموز.
 *
 * ── إيه اللي اتغيّر ─────────────────────────────────────────
 *
 * **ولا حاجة في الشكل.** كل صنف لوني اتبدّل برمز بيشاور على **نفس**
 * لون Tailwind اللي كان مكتوب:
 *   bg-amber-500 → bg-brand          (var(--color-amber-500))
 *   bg-rose-500  → bg-enha-lak       (var(--color-rose-500))
 *   bg-emerald-500 → bg-journey      (var(--color-emerald-500))
 *   rounded-xl   → rounded-control   (0.75rem — نفس القيمة)
 *
 * المكسب إن تغيير لون الهوية بقى سطر في `globals.css` بدل ما يكون
 * تعديل في كل ملف بيستخدم لونًا.
 *
 * ── الأسماء القديمة لسه شغّالة ──────────────────────────────
 *
 * `accentColor` بتقبل الاسم الدلالي الجديد (`brand`/`enhaLak`/`journey`)
 * **والاسم اللوني القديم** (`amber`/`rose`/`emerald`). عشان كده مفيش
 * ولا موضع نداء محتاج يتغيّر دلوقتي — الترحيل بيحصل عند لمس كل ملف.
 *
 * ⚠️ **الجديد يستخدم الاسم الدلالي.** الاسم اللوني بيربط الكود بلون
 *    بعينه، وده بالظبط اللي بنخرج منه.
 */

/** الاسم الدلالي — ده اللي يتكتب في أي كود جديد. */
type Accent = 'brand' | 'enhaLak' | 'journey';
/** الاسم اللوني القديم — باقٍ للتوافق مع مواضع النداء الحالية. */
type LegacyAccent = 'amber' | 'rose' | 'emerald';

const ACCENT_ALIAS: Record<LegacyAccent, Accent> = {
  amber: 'brand',
  rose: 'enhaLak',
  emerald: 'journey',
};

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  accentColor?: Accent | LegacyAccent;
  size?: 'md' | 'lg';
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export function Button({
  variant = 'primary',
  accentColor = 'brand',
  size = 'md',
  href,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const accent: Accent =
    accentColor in ACCENT_ALIAS
      ? ACCENT_ALIAS[accentColor as LegacyAccent]
      : (accentColor as Accent);

  // `min-h-[44px]` = أصغر هدف لمس مقبول على الموبايل، وهي **الموضع
  // الوحيد** في المشروع كله اللي بيضمن ده.
  //
  // ⚠️ جرّبت أكتبها `min-h-[var(--tap-min)]` بالرمز، وبنيت وفحصت الـCSS
  //    المولَّد: **الصنف ده ما اتولّدش خالص**، يعني الزرار كان هيفقد
  //    الـ44px بلا أي تحذير. فبقيت على القيمة الحرفية.
  //    الرمز `--tap-min` معرَّف في `globals.css` وبيتطبّق في المرحلة ٥
  //    على كل الأهداف، وساعتها بيتجرّب في بناء حقيقي قبل ما يتعمّم.
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-colors rounded-control min-h-[44px]';

  const sizeStyles = {
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // ── المرحلة ١: التباين ──────────────────────────────────
  //
  // النص على الزر الأساسي كان **أبيض**، والنسب المحسوبة على قيم
  // Tailwind 4 الحقيقية (oklch مش hex v3):
  //
  //   أبيض على amber-500    2.15:1  ✗   (المطلوب 4.5:1)
  //   أبيض على emerald-500  2.46:1  ✗
  //   أبيض على rose-500     3.76:1  ✗
  //
  // يعني **كل زر أساسي في الموقع** كان راسبًا في المعيار.
  //
  // الحل اللي اتاخد: الألوان الحيّة تفضل زي ما هي بالظبط، والنص بيبقى
  // داكن (`-ink` = slate-900):
  //
  //   slate-900 على amber-500    8.32:1  ✓
  //   slate-900 على emerald-500  7.24:1  ✓
  //   slate-900 على rose-500     4.75:1  ✓
  //
  // والزر الثانوي كان أسوأ: الحدّ `amber-500` = 2.11:1 (عنصر غير نصي
  // محتاج 3:1)، والنص `amber-600` = 3.14:1. بقوا `-border` (600) و
  // `-strong` (700).
  const colorStyles = {
    primary: {
      brand: 'bg-brand text-brand-ink hover:bg-brand-hover',
      enhaLak: 'bg-enha-lak text-enha-lak-ink hover:bg-enha-lak-hover',
      journey: 'bg-journey text-journey-ink hover:bg-journey-hover',
    },
    secondary: {
      brand:
        'bg-transparent border-2 border-brand-border text-brand-strong hover:bg-brand-soft',
      enhaLak:
        'bg-transparent border-2 border-enha-lak-border text-enha-lak-strong hover:bg-enha-lak-soft',
      journey:
        'bg-transparent border-2 border-journey-border text-journey-strong hover:bg-journey-soft',
    },
  } as const;

  const classes = `${baseStyles} ${sizeStyles[size]} ${colorStyles[variant][accent]} ${className}`;

  if (href) {
    if (disabled) {
      return (
        <span className={`${classes} opacity-50 cursor-not-allowed`}>
          {children}
        </span>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
