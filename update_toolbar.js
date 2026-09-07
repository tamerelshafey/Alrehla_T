const fs = require('fs');
let content = fs.readFileSync('src/components/dev/DevAuthToolbar.tsx', 'utf8');

if (!content.includes("{ label: 'ناشر', value: 'publisher' }")) {
  content = content.replace(
    "{ label: 'مدرب', value: 'instructor' },",
    "{ label: 'مدرب', value: 'instructor' },\n  { label: 'ناشر', value: 'publisher' },"
  );
  fs.writeFileSync('src/components/dev/DevAuthToolbar.tsx', content, 'utf8');
}
console.log('DevAuthToolbar updated.');
