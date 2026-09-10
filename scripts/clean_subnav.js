const fs = require('fs');
const glob = require('glob');

const files = [
  'src/app/enha-lak/subscription/page.tsx',
  'src/app/enha-lak/library/page.tsx',
  'src/app/enha-lak/custom/page.tsx',
  'src/app/creative-writing/packages/page.tsx',
  'src/app/creative-writing/services/page.tsx',
  'src/app/creative-writing/instructors/page.tsx',
  'src/app/creative-writing/about/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import \{ SectionSubNav \} from '@\/components\/SectionSubNav';/g, '');
    content = content.replace(/const enhaLakTabs[\s\S]*?\];/g, '');
    content = content.replace(/const creativeWritingTabs[\s\S]*?\];/g, '');
    
    // Remove the subNav prop from SectionHeader
    content = content.replace(/subNav=\{[\s\S]*?<\/SectionSubNav>\s*\}/g, '');
    content = content.replace(/subNav=\{[\s\S]*?<SectionSubNav[\s\S]*?\/>\s*\}/g, '');
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Cleaned subnav from inner pages.');
