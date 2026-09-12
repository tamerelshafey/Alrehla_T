const fs = require('fs');
let content = fs.readFileSync('src/data/domains/writing.ts', 'utf8');
content = content.replace(/return mockDocuments\.filter[^{}]+}\s+return null;/g, (match) => {
  return match.replace('return null;', 'return [];');
});
fs.writeFileSync('src/data/domains/writing.ts', content);
