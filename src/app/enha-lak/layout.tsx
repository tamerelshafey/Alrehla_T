
import React from 'react';
import { Sparkles } from 'lucide-react';

export default function EnhaLakLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#FFFBFD] to-[#FDF5F7] selection:bg-rose-200 selection:text-rose-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-rose-200/40 to-fuchsia-200/40 blur-[100px]" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-violet-200/30 to-purple-200/30 blur-[100px]" />
      </div>
      
      {/* Custom Header for Enha Lak */}
      <div className="relative border-b border-rose-100 bg-white/60 backdrop-blur-lg border-b-rose-100/50 shadow-[0_4px_30px_rgba(244,63,94,0.03)]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 py-4 text-rose-600">
          <Sparkles className="h-5 w-5" />
          <span className="font-bold tracking-wide">عالم إنها لك - حيث يتحول الخيال إلى واقع</span>
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
