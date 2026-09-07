const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const homeSlidesDef = `
const homeSlides = [
  {
    id: '1',
    title: 'رحلتان مختلفتان... ومساحة واحدة للحكاية والنمو',
    description: '«الرحلة» منصة عربية أسرية تجمع مشروعين: «إنها لك» و«بداية الرحلة».',
    image: 'https://picsum.photos/seed/magicbook/1600/900',
    ctaText: 'ابدأ الرحلة',
    ctaLink: '/about',
    theme: 'amber' as const,
  },
  {
    id: '2',
    title: 'إنها لك: حيث يتحول الخيال إلى واقع',
    description: 'قصص ومنتجات مخصصة تجعل الطفل جزءًا من الحكاية، وتجعل الأسرة شريكةً.',
    image: 'https://picsum.photos/seed/kidsstory/1600/900',
    ctaText: 'استكشف إنها لك',
    ctaLink: '/enha-lak',
    theme: 'violet' as const,
  },
  {
    id: '3',
    title: 'أكاديمية بداية الرحلة',
    description: 'برنامج فردي للكتابة الإبداعية يساعد الشباب والأطفال على اكتشاف أصواتهم الخاصة.',
    image: 'https://picsum.photos/seed/childwriting/1600/900',
    ctaText: 'تعرف على الأكاديمية',
    ctaLink: '/creative-writing',
    theme: 'emerald' as const,
  }
];
`;

if (!content.includes('const homeSlides = [')) {
  content = content.replace(
    'export default async function HomePage() {',
    homeSlidesDef + '\nexport default async function HomePage() {'
  );
  fs.writeFileSync('src/app/page.tsx', content, 'utf8');
}
