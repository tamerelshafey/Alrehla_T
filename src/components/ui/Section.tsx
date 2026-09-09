import React from 'react';

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
};

export function Section({ children, className = '', containerClassName = '', id }: SectionProps) {
  return (
    <section id={id} className={`py-16 md:py-24 px-4 ${className}`}>
      <div className={`max-w-6xl mx-auto ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
}
