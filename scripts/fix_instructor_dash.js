const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/instructor/page.tsx', 'utf8');

if (!content.includes("import Link from 'next/link';")) {
  content = content.replace(
    "import { redirect } from 'next/navigation';",
    "import { redirect } from 'next/navigation';\nimport Link from 'next/link';"
  );
  fs.writeFileSync('src/app/dashboard/instructor/page.tsx', content, 'utf8');
}
console.log('Fixed Link import.');
