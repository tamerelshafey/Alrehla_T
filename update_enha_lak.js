const fs = require('fs');

const enhaLakTabs = `import { SectionSubNav } from '@/components/SectionSubNav';

const enhaLakTabs = [
  { name: 'نظرة عامة', href: '/enha-lak' },
  { name: 'أنت البطل هنا', href: '/enha-lak/custom' },
  { name: 'المكتبة العامة', href: '/enha-lak/library' },
  { name: 'صندوق الرحلة', href: '/enha-lak/subscription' },
];
`;

const files = [
  'src/app/enha-lak/page.tsx',
  'src/app/enha-lak/custom/page.tsx',
  'src/app/enha-lak/library/page.tsx',
  'src/app/enha-lak/subscription/page.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add imports
  content = content.replace(/(import .*;\n)+/, (match) => match + enhaLakTabs + '\n');
  
  // Add SectionSubNav
  content = content.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/, (match) => match + '\n        <SectionSubNav tabs={enhaLakTabs} activeColorClass="bg-rose-500 text-white" />');
  
  fs.writeFileSync(file, content, 'utf8');
}
console.log("Enha lak pages updated.");
