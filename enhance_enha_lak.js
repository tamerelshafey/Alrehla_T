const fs = require('fs');

let enhaLakLayout = fs.readFileSync('src/app/enha-lak/layout.tsx', 'utf8');

if (!enhaLakLayout.includes('bg-gradient-to-br')) {
  // Update Enha Lak layout to be more magical and immersive
  enhaLakLayout = enhaLakLayout.replace(
    'bg-[#FFFBFD]',
    'bg-gradient-to-br from-[#FFFBFD] to-[#FDF5F7]'
  );
  enhaLakLayout = enhaLakLayout.replace(
    'bg-rose-100/50',
    'bg-gradient-to-tr from-rose-200/40 to-fuchsia-200/40'
  );
  enhaLakLayout = enhaLakLayout.replace(
    'bg-violet-100/40',
    'bg-gradient-to-bl from-violet-200/30 to-purple-200/30'
  );
  
  // Make the header more integrated
  enhaLakLayout = enhaLakLayout.replace(
    'bg-white/50 backdrop-blur-md',
    'bg-white/60 backdrop-blur-lg border-b-rose-100/50 shadow-[0_4px_30px_rgba(244,63,94,0.03)]'
  );
  
  fs.writeFileSync('src/app/enha-lak/layout.tsx', enhaLakLayout, 'utf8');
}

console.log('Enha Lak area enhanced.');
