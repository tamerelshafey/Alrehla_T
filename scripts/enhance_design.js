const fs = require('fs');

// 1. Update Root Layout (Main Area)
let rootLayout = fs.readFileSync('src/app/layout.tsx', 'utf8');
if (!rootLayout.includes('bg-slate-50/50')) {
  rootLayout = rootLayout.replace(
    'className={`${cairo.variable} flex min-h-screen flex-col font-sans text-slate-800 antialiased`}',
    'className={`${cairo.variable} flex min-h-screen flex-col font-sans text-slate-800 antialiased bg-slate-50/50 selection:bg-amber-200 selection:text-amber-900`}'
  );
  
  if (!rootLayout.includes('fixed top-0 left-0 right-0 h-1')) {
    rootLayout = rootLayout.replace(
      '<ScrollToTop />',
      '<ScrollToTop />\n        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-l from-amber-400 via-rose-500 to-emerald-500 z-[100]" />'
    );
  }
  fs.writeFileSync('src/app/layout.tsx', rootLayout, 'utf8');
}

// 2. Enhance Home Page (Main Area)
let homePage = fs.readFileSync('src/app/page.tsx', 'utf8');
if (!homePage.includes('bg-gradient-to-bl')) {
  // Add a modern subtle mesh gradient to the hero section
  homePage = homePage.replace(
    '<section className="relative overflow-hidden bg-slate-50 py-20 lg:py-32">',
    `<section className="relative overflow-hidden bg-slate-50 py-20 lg:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-bl from-amber-100/40 to-transparent blur-3xl" />
          <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-blue-100/40 to-transparent blur-3xl" />
        </div>`
  );
  fs.writeFileSync('src/app/page.tsx', homePage, 'utf8');
}

console.log('Main area layout and homepage enhanced.');
