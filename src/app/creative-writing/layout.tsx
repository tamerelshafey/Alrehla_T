import React from 'react';
import { HeroCarousel } from '@/components/HeroCarousel';
import { SectionSubNav } from '@/components/SectionSubNav';
import { getSiteSettings } from '@/data/domains/content';

const creativeWritingTabs = [
  { name: 'نظرة عامة', href: '/creative-writing' },
  { name: 'عن البرنامج', href: '/creative-writing/about' },
  { name: 'الباقات', href: '/creative-writing/packages' },
  { name: 'المدربون', href: '/creative-writing/instructors' },
  { name: 'الخدمات الإبداعية', href: '/creative-writing/services' },
];



export default async function CreativeWritingLayout({ children }: { children: React.ReactNode }) {
  // These were three stock photographs from picsum.photos.
  const settings = await getSiteSettings();
  const creativeSlides = [
    {
      id: '1',
      title: 'رحلة كتابة، لا درس كتابة',
      description: 'أكاديمية بداية الرحلة للكتابة الإبداعية تساعد الشباب والأطفال على اكتشاف أصواتهم.',
      image: settings.images.creativeSlide1 ?? '',
      slotKey: 'creativeSlide1' as const,
      ctaText: 'استكشف الباقات',
      ctaLink: '/creative-writing/packages',
      theme: 'emerald' as const,
    },
    {
      id: '2',
      title: 'تطوير المهارات برعاية خبراء',
      description: 'جلسات تفاعلية، توجيه فردي، وتطوير مستمر لمهارات السرد والتعبير.',
      image: settings.images.creativeSlide2 ?? '',
      slotKey: 'creativeSlide2' as const,
      ctaText: 'تعرف على مدربينا',
      ctaLink: '/creative-writing/instructors',
      theme: 'teal' as const,
    },
    {
      id: '3',
      title: 'خدمات إبداعية متكاملة',
      description: 'من التحرير والتدقيق إلى الاستشارات الأدبية، نحن هنا لدعم قلمك.',
      image: settings.images.creativeSlide3 ?? '',
      slotKey: 'creativeSlide3' as const,
      ctaText: 'عرض الخدمات',
      ctaLink: '/creative-writing/services',
      theme: 'emerald' as const,
    }
  ];

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
