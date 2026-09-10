const fs = require('fs');

const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// The first replacement failed because the target string was different, so let's just add the imports at the top
content = `import { getPublishers } from '@/data/domains/products';
import { getInstructors } from '@/data/domains/writing';
` + content;

// Also add types to the filter functions
content = content.replace(
  "const activePublishers = publishers.filter(p => p.status === 'active').slice(0, 4);",
  "const activePublishers = publishers.filter((p: any) => p.status === 'active').slice(0, 4);"
);

content = content.replace(
  "const topInstructors = instructors.filter(i => i.status === 'active').slice(0, 4);",
  "const topInstructors = instructors.filter((i: any) => i.status === 'active').slice(0, 4);"
);

content = content.replace(
  "          {topInstructors.map(instructor => (",
  "          {topInstructors.map((instructor: any) => ("
);

content = content.replace(
  "          {activePublishers.map(publisher => (",
  "          {activePublishers.map((publisher: any) => ("
);

fs.writeFileSync(path, content);
