const fs = require('fs');

const creativeWritingTabs = `import { SectionSubNav } from '@/components/SectionSubNav';

const creativeWritingTabs = [
  { name: 'نظرة عامة', href: '/creative-writing' },
  { name: 'عن البرنامج', href: '/creative-writing/about' },
  { name: 'الباقات', href: '/creative-writing/packages' },
  { name: 'المدربون', href: '/creative-writing/instructors' },
  { name: 'الخدمات الإبداعية', href: '/creative-writing/services' },
];
`;

const files = [
  'src/app/creative-writing/page.tsx',
  'src/app/creative-writing/about/page.tsx',
  'src/app/creative-writing/packages/page.tsx',
  'src/app/creative-writing/instructors/page.tsx',
  'src/app/creative-writing/services/page.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add imports
  content = content.replace(/(import .*;\n)+/, (match) => match + creativeWritingTabs + '\n');
  
  // Add SectionSubNav
  content = content.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/, (match) => match + '\n        <SectionSubNav tabs={creativeWritingTabs} activeColorClass="bg-sky-600 text-white" />');
  
  fs.writeFileSync(file, content, 'utf8');
}
console.log("Creative writing pages updated.");
