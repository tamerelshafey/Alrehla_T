const fs = require('fs');

const enhaLakLayout = `
import React from 'react';
import { Sparkles } from 'lucide-react';

export default function EnhaLakLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#FFFBFD] selection:bg-rose-200 selection:text-rose-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-rose-100/50 blur-[100px]" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-violet-100/40 blur-[100px]" />
      </div>
      
      {/* Custom Header for Enha Lak */}
      <div className="relative border-b border-rose-100 bg-white/50 backdrop-blur-md">
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
`;

const creativeWritingLayout = `
import React from 'react';
import { Feather } from 'lucide-react';

export default function CreativeWritingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#F8FAF9] selection:bg-emerald-200 selection:text-emerald-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-50/50 blur-[100px]" />
      </div>
      
      {/* Custom Header for Creative Writing */}
      <div className="relative border-b border-emerald-100 bg-white/50 backdrop-blur-md">
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
`;

fs.writeFileSync('src/app/enha-lak/layout.tsx', enhaLakLayout);
fs.writeFileSync('src/app/creative-writing/layout.tsx', creativeWritingLayout);
console.log('Layouts created.');
