const fs = require('fs');

const layoutContent = `import React from 'react';
import { HeroCarousel } from '@/components/HeroCarousel';
import { SectionSubNav } from '@/components/SectionSubNav';

const enhaLakTabs = [
  { name: 'نظرة عامة', href: '/enha-lak' },
  { name: 'أنت البطل هنا', href: '/enha-lak/custom' },
  { name: 'المكتبة العامة', href: '/enha-lak/library' },
  { name: 'صندوق الرحلة', href: '/enha-lak/subscription' },
];

const enhaLakSlides = [
  {
    id: '1',
    title: 'قصتك أنت البطل فيها',
    description: 'نصنع قصصاً مخصصة تجعل طفلك محور الأحداث وتغرس فيه أجمل القيم.',
    image: 'https://picsum.photos/seed/enhalak1/1600/900',
    ctaText: 'اصنع قصتك',
    ctaLink: '/enha-lak/custom',
    theme: 'violet' as const,
  },
  {
    id: '2',
    title: 'صندوق الرحلة السحري',
    description: 'اشتراكات شهرية مليئة بالمفاجآت والكتب الممتعة لتنمية حب القراءة.',
    image: 'https://picsum.photos/seed/enhalak2/1600/900',
    ctaText: 'اكتشف الصندوق',
    ctaLink: '/enha-lak/subscription',
    theme: 'rose' as const,
  },
  {
    id: '3',
    title: 'مكتبة الخيال الواسعة',
    description: 'تصفح قصصنا وإصداراتنا المتنوعة التي تناسب مختلف الأعمار.',
    image: 'https://picsum.photos/seed/enhalak3/1600/900',
    ctaText: 'تصفح المكتبة',
    ctaLink: '/enha-lak/library',
    theme: 'violet' as const,
  }
];

export default function EnhaLakLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#FFFBFD] to-[#FDF5F7] selection:bg-rose-200 selection:text-rose-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-rose-200/40 to-fuchsia-200/40 blur-[100px]" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-violet-200/30 to-purple-200/30 blur-[100px]" />
      </div>
      
      <div className="relative z-10">
        <SectionSubNav tabs={enhaLakTabs} activeColorClass="bg-rose-600 text-white" />
        
        <section className="mx-auto w-full max-w-7xl pb-12 px-4 md:px-8">
          <HeroCarousel slides={enhaLakSlides} />
        </section>
        
        {children}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/app/enha-lak/layout.tsx', layoutContent, 'utf8');

// Now remove them from page.tsx
let pageContent = fs.readFileSync('src/app/enha-lak/page.tsx', 'utf8');
pageContent = pageContent.replace(/const enhaLakTabs[\s\S]*?\];/, '');
pageContent = pageContent.replace(/const enhaLakSlides[\s\S]*?\];/, '');
pageContent = pageContent.replace(/<section className="mx-auto w-full max-w-7xl pt-8 pb-12">[\s\S]*?<\/section>/, '');
pageContent = pageContent.replace(/<div className="mx-auto max-w-4xl text-center mb-16">[\s\S]*?<\/div>/, '');
pageContent = pageContent.replace(/import \{ HeroCarousel \} from '@\/components\/HeroCarousel';/, '');
pageContent = pageContent.replace(/import \{ SectionSubNav \} from '@\/components\/SectionSubNav';/, '');

// also remove from other pages in enha-lak if they had subnav
fs.writeFileSync('src/app/enha-lak/page.tsx', pageContent, 'utf8');

console.log('enha-lak layout updated.');
