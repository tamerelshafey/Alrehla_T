const fs = require('fs');
let content = fs.readFileSync('src/app/creative-writing/page.tsx', 'utf8');

// Insert import if missing
if (!content.includes('import { HeroCarousel }')) {
  content = content.replace(
    'import { getTestimonials } from \'@/data/mock\';',
    'import { getTestimonials } from \'@/data/mock\';\nimport { HeroCarousel } from \'@/components/HeroCarousel\';'
  );
}

// Define creativeSlides array
const creativeSlidesDef = `
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
`;

if (!content.includes('const creativeSlides')) {
  content = content.replace(
    'export default async function CreativeWritingPage() {',
    creativeSlidesDef + '\nexport default async function CreativeWritingPage() {'
  );
}

// Extract the subnav to keep it
const subNavMatch = content.match(/(<SectionSubNav[\s\S]*?\/>)/);
const subNavStr = subNavMatch ? subNavMatch[1] : '';

// Replace SectionHeader
const newHero = `
      {/* Hero Section Carousel */}
      <section className="mx-auto w-full max-w-7xl pt-8 pb-12">
        <HeroCarousel slides={creativeSlides} />
      </section>
      
      {/* Sub Navigation */}
      <div className="mx-auto max-w-4xl text-center mb-16">
        ${subNavStr}
      </div>
`;

content = content.replace(/<SectionHeader[\s\S]*?<\/SectionHeader>/, newHero);

fs.writeFileSync('src/app/creative-writing/page.tsx', content, 'utf8');
console.log('Creative Writing page updated with slider.');
