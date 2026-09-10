const fs = require('fs');
let content = fs.readFileSync('src/app/layout.tsx', 'utf8');

// Add a modern subtle background to the root layout if not present
if (!content.includes('bg-[#FCFDFD]')) {
  content = content.replace(
    'className={`${cairo.variable} flex min-h-screen flex-col font-sans text-slate-800 antialiased`}',
    'className={`${cairo.variable} flex min-h-screen flex-col font-sans text-slate-800 antialiased bg-[#FCFDFD] selection:bg-amber-200 selection:text-amber-900`}'
  );
  
  // Add a subtle top progress bar effect or geometric element
  content = content.replace(
    '<ScrollToTop />',
    '<ScrollToTop />\n        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-500 z-50" />'
  );
  
  fs.writeFileSync('src/app/layout.tsx', content, 'utf8');
  console.log('Root layout improved.');
}
