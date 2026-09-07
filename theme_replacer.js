const fs = require('fs');
const path = require('path');

function replaceInDir(dir, rules) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath, rules);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of rules) {
        content = content.replace(rule.from, rule.to);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

const enhaLakRules = [
  { from: /text-blue-600/g, to: 'text-violet-600' },
  { from: /bg-blue-50/g, to: 'bg-violet-50' },
  { from: /hover:text-blue-800/g, to: 'hover:text-violet-800' },
  { from: /bg-sky-600/g, to: 'bg-rose-600' },
  { from: /bg-rose-500/g, to: 'bg-rose-600' }, 
  { from: /text-amber-500/g, to: 'text-rose-500' },
  { from: /text-amber-600/g, to: 'text-rose-600' },
  { from: /bg-amber-500/g, to: 'bg-rose-500' },
  { from: /hover:bg-amber-600/g, to: 'hover:bg-rose-600' },
  { from: /border-blue-200/g, to: 'border-violet-200' },
  { from: /border-blue-100/g, to: 'border-violet-100' },
];

const creativeRules = [
  { from: /text-amber-500/g, to: 'text-emerald-500' },
  { from: /text-amber-600/g, to: 'text-emerald-600' },
  { from: /bg-amber-500/g, to: 'bg-emerald-500' },
  { from: /hover:bg-amber-600/g, to: 'hover:bg-emerald-600' },
  { from: /text-blue-600/g, to: 'text-teal-600' },
  { from: /bg-blue-50/g, to: 'bg-teal-50' },
  { from: /bg-sky-600/g, to: 'bg-emerald-600' },
  { from: /bg-indigo-600/g, to: 'bg-emerald-600' },
  { from: /bg-indigo-50/g, to: 'bg-emerald-50' },
  { from: /border-indigo-200/g, to: 'border-emerald-200' },
];

replaceInDir('src/app/enha-lak', enhaLakRules);
replaceInDir('src/app/creative-writing', creativeRules);
console.log('Themes applied successfully.');
