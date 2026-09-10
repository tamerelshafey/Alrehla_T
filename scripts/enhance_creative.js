const fs = require('fs');

let creativeLayout = fs.readFileSync('src/app/creative-writing/layout.tsx', 'utf8');

if (!creativeLayout.includes('bg-gradient-to-b')) {
  // Update Creative Writing layout to be more academic and focused
  creativeLayout = creativeLayout.replace(
    'bg-[#F8FAF9]',
    'bg-gradient-to-b from-[#F8FAF9] to-[#F1F6F4]'
  );
  creativeLayout = creativeLayout.replace(
    'bg-emerald-50/50',
    'bg-gradient-to-br from-emerald-100/30 to-teal-100/30'
  );
  
  // Make the header more integrated
  creativeLayout = creativeLayout.replace(
    'bg-white/50 backdrop-blur-md',
    'bg-white/70 backdrop-blur-md border-b-emerald-100/50 shadow-[0_4px_20px_rgba(16,185,129,0.03)]'
  );
  
  fs.writeFileSync('src/app/creative-writing/layout.tsx', creativeLayout, 'utf8');
}

console.log('Creative Writing area enhanced.');
