const fs = require('fs');

let enhaLakLayout = fs.readFileSync('src/app/enha-lak/layout.tsx', 'utf8');
enhaLakLayout = enhaLakLayout.replace(/{[\s\S]*?Custom Header for Enha Lak[\s\S]*?<\/div>\s*<\/div>/, '');
fs.writeFileSync('src/app/enha-lak/layout.tsx', enhaLakLayout, 'utf8');

let creativeLayout = fs.readFileSync('src/app/creative-writing/layout.tsx', 'utf8');
creativeLayout = creativeLayout.replace(/{[\s\S]*?Custom Header for Creative Writing[\s\S]*?<\/div>\s*<\/div>/, '');
fs.writeFileSync('src/app/creative-writing/layout.tsx', creativeLayout, 'utf8');

console.log('Layouts fixed.');
