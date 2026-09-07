const fs = require('fs');
let content = fs.readFileSync('src/components/HeroCarousel.tsx', 'utf8');

content = content.replace(
  "theme?: 'amber' | 'rose' | 'emerald' | 'violet';",
  "theme?: 'amber' | 'rose' | 'emerald' | 'violet' | 'teal';"
);

content = content.replace(
  "violet: 'bg-violet-500 hover:bg-violet-600 text-white',",
  "violet: 'bg-violet-500 hover:bg-violet-600 text-white',\n    teal: 'bg-teal-500 hover:bg-teal-600 text-white',"
);

fs.writeFileSync('src/components/HeroCarousel.tsx', content, 'utf8');
