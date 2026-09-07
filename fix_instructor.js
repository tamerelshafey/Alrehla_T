const fs = require('fs');
let content = fs.readFileSync('src/app/creative-writing/instructors/[id]/page.tsx', 'utf8');
content = content.replace(/instructor\.name/g, 'instructor.displayName');
content = content.replace(/instructor\.title/g, 'instructor.specialties[0] || "مدرب معتمد"');
fs.writeFileSync('src/app/creative-writing/instructors/[id]/page.tsx', content, 'utf8');
console.log('Fixed instructor properties.');
