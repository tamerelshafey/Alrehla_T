import React from 'react';
import Link from 'next/link';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  accentColor?: 'amber' | 'rose' | 'emerald';
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
  accentColor = 'amber',
  size = 'md',
  href,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-colors rounded-xl min-h-[44px]";
  
  const sizeStyles = {
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const colorStyles = {
    primary: {
      amber: "bg-amber-500 text-white hover:bg-amber-600",
      rose: "bg-rose-500 text-white hover:bg-rose-600",
      emerald: "bg-emerald-500 text-white hover:bg-emerald-600",
    },
    secondary: {
      amber: "bg-transparent border-2 border-amber-500 text-amber-600 hover:bg-amber-50",
      rose: "bg-transparent border-2 border-rose-500 text-rose-600 hover:bg-rose-50",
      emerald: "bg-transparent border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50",
    }
  };

  const classes = `${baseStyles} ${sizeStyles[size]} ${colorStyles[variant][accentColor]} ${className}`;

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
