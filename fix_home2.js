const fs = require('fs');

const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "export default function Home() {",
  "export default async function Home() {\n  const publishers = await getPublishers();\n  const activePublishers = publishers.filter(p => p.status === 'active').slice(0, 4);\n  const instructors = await getInstructors();\n  const topInstructors = instructors.filter(i => i.status === 'active').slice(0, 4);"
);

fs.writeFileSync(path, content);
