const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

const publisherType = `
// الناشر
export type Publisher = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  bio: string;
  isSample: boolean;
};
`;

content = content + publisherType;

// Add publisherId to PersonalizedProduct
content = content.replace(
  'coverImageUrl?: string;\n};',
  'coverImageUrl?: string;\n  publisherId?: string;\n};'
);

fs.writeFileSync('src/types/index.ts', content, 'utf8');
console.log('Types updated.');
