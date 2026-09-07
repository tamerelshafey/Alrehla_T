
import React from 'react';
import { Feather } from 'lucide-react';

export default function CreativeWritingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F8FAF9] to-[#F1F6F4] selection:bg-emerald-200 selection:text-emerald-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-100/30 to-teal-100/30 blur-[100px]" />
      </div>
      
      {/* Custom Header for Creative Writing */}
      <div className="relative border-b border-emerald-100 bg-white/70 backdrop-blur-md border-b-emerald-100/50 shadow-[0_4px_20px_rgba(16,185,129,0.03)]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 py-4 text-emerald-700">
          <Feather className="h-5 w-5" />
          <span className="font-bold tracking-wide uppercase text-sm">أكاديمية بداية الرحلة للكتابة الإبداعية</span>
          <Feather className="h-5 w-5" />
        </div>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
