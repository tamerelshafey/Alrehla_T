const fs = require('fs');

const layoutContent = `import React from 'react';
import { HeroCarousel } from '@/components/HeroCarousel';
import { SectionSubNav } from '@/components/SectionSubNav';

const creativeWritingTabs = [
  { name: 'نظرة عامة', href: '/creative-writing' },
  { name: 'عن البرنامج', href: '/creative-writing/about' },
  { name: 'الباقات', href: '/creative-writing/packages' },
  { name: 'المدربون', href: '/creative-writing/instructors' },
  { name: 'الخدمات الإبداعية', href: '/creative-writing/services' },
];

const creativeSlides = [
  {
    id: '1',
    title: 'رحلة كتابة، لا درس كتابة',
    description: 'أكاديمية بداية الرحلة للكتابة الإبداعية تساعد الشباب والأطفال على اكتشاف أصواتهم.',
    image: 'https://picsum.photos/seed/creative1/1600/900',
    ctaText: 'استكشف الباقات',
    ctaLink: '/creative-writing/packages',
    theme: 'emerald' as const,
  },
  {
    id: '2',
    title: 'تطوير المهارات برعاية خبراء',
    description: 'جلسات تفاعلية، توجيه فردي، وتطوير مستمر لمهارات السرد والتعبير.',
    image: 'https://picsum.photos/seed/creative2/1600/900',
    ctaText: 'تعرف على مدربينا',
    ctaLink: '/creative-writing/instructors',
    theme: 'teal' as const,
  },
  {
    id: '3',
    title: 'خدمات إبداعية متكاملة',
    description: 'من التحرير والتدقيق إلى الاستشارات الأدبية، نحن هنا لدعم قلمك.',
    image: 'https://picsum.photos/seed/creative3/1600/900',
    ctaText: 'عرض الخدمات',
    ctaLink: '/creative-writing/services',
    theme: 'emerald' as const,
  }
];

export default function CreativeWritingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#F8FAF9] to-[#F1F6F4] selection:bg-emerald-200 selection:text-emerald-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-100/30 to-teal-100/30 blur-[100px]" />
      </div>
      
      <div className="relative z-10">
        <SectionSubNav tabs={creativeWritingTabs} activeColorClass="bg-emerald-600 text-white" />
        
        <section className="mx-auto w-full max-w-7xl pb-12 px-4 md:px-8">
          <HeroCarousel slides={creativeSlides} />
        </section>

        {children}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/app/creative-writing/layout.tsx', layoutContent, 'utf8');

// Now remove them from page.tsx
let pageContent = fs.readFileSync('src/app/creative-writing/page.tsx', 'utf8');
pageContent = pageContent.replace(/const creativeWritingTabs[\s\S]*?\];/, '');
pageContent = pageContent.replace(/const creativeSlides[\s\S]*?\];/, '');
pageContent = pageContent.replace(/<section className="mx-auto w-full max-w-7xl pt-8 pb-12">[\s\S]*?<\/section>/, '');
pageContent = pageContent.replace(/<div className="mx-auto max-w-4xl text-center mb-16">[\s\S]*?<\/div>/, '');
pageContent = pageContent.replace(/import \{ HeroCarousel \} from '@\/components\/HeroCarousel';/, '');
pageContent = pageContent.replace(/import \{ SectionSubNav \} from '@\/components\/SectionSubNav';/, '');

fs.writeFileSync('src/app/creative-writing/page.tsx', pageContent, 'utf8');

console.log('creative-writing layout updated.');
