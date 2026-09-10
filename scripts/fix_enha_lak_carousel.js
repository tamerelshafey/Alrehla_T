const fs = require('fs');
let content = fs.readFileSync('src/app/enha-lak/page.tsx', 'utf8');

// Insert import if missing
if (!content.includes('import { HeroCarousel }')) {
  content = content.replace(
    'import Link from \'next/link\';',
    'import Link from \'next/link\';\nimport { HeroCarousel } from \'@/components/HeroCarousel\';'
  );
}

// Define enhaLakSlides array
const enhaLakSlidesDef = `
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
`;

if (!content.includes('const enhaLakSlides')) {
  content = content.replace(
    'export default async function EnhaLakPage() {',
    enhaLakSlidesDef + '\nexport default async function EnhaLakPage() {'
  );
}

// Extract the subnav to keep it
const subNavMatch = content.match(/(<SectionSubNav[\s\S]*?\/>)/);
const subNavStr = subNavMatch ? subNavMatch[1] : '';

// Replace SectionHeader
const newHero = `
      {/* Hero Section Carousel */}
      <section className="mx-auto w-full max-w-7xl pt-8 pb-12">
        <HeroCarousel slides={enhaLakSlides} />
      </section>
      
      {/* Sub Navigation */}
      <div className="mx-auto max-w-4xl text-center mb-16">
        ${subNavStr}
      </div>
`;

content = content.replace(/<SectionHeader[\s\S]*?<\/SectionHeader>/, newHero);

fs.writeFileSync('src/app/enha-lak/page.tsx', content, 'utf8');
console.log('Enha Lak page updated with slider.');
