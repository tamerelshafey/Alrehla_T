import React from 'react';
import { HeroCarousel } from '@/components/HeroCarousel';
import { SectionSubNav } from '@/components/SectionSubNav';
import { getSiteSettings } from '@/data/domains/content';

const enhaLakTabs = [
  { name: 'نظرة عامة', href: '/enha-lak' },
  { name: 'أنت البطل هنا', href: '/enha-lak/custom' },
  { name: 'المكتبة العامة', href: '/enha-lak/library' },
  { name: 'صندوق الرحلة', href: '/enha-lak/subscription' },
];



export default async function EnhaLakLayout({ children }: { children: React.ReactNode }) {
  // These were three stock photographs from picsum.photos.
  const settings = await getSiteSettings();
  const enhaLakSlides = [
    {
      id: '1',
      title: 'قصتك أنت البطل فيها',
      description: 'نصنع قصصاً مخصصة تجعل طفلك محور الأحداث وتغرس فيه أجمل القيم.',
      image: settings.images.enhaLakSlide1 ?? '',
      slotKey: 'enhaLakSlide1' as const,
      ctaText: 'اصنع قصتك',
      ctaLink: '/enha-lak/custom',
      theme: 'violet' as const,
    },
    {
      id: '2',
      title: 'صندوق الرحلة السحري',
      description: 'اشتراكات شهرية مليئة بالمفاجآت والكتب الممتعة لتنمية حب القراءة.',
      image: settings.images.enhaLakSlide2 ?? '',
      slotKey: 'enhaLakSlide2' as const,
      ctaText: 'اكتشف الصندوق',
      ctaLink: '/enha-lak/subscription',
      theme: 'rose' as const,
    },
    {
      id: '3',
      title: 'مكتبة الخيال الواسعة',
      description: 'تصفح قصصنا وإصداراتنا المتنوعة التي تناسب مختلف الأعمار.',
      image: settings.images.enhaLakSlide3 ?? '',
      slotKey: 'enhaLakSlide3' as const,
      ctaText: 'تصفح المكتبة',
      ctaLink: '/enha-lak/library',
      theme: 'violet' as const,
    }
  ];

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
