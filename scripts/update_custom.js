const fs = require('fs');

let content = fs.readFileSync('src/app/enha-lak/custom/page.tsx', 'utf8');

// Ensure Link is imported
if (!content.includes('import Link from')) {
  content = content.replace("import Image from 'next/image';", "import Image from 'next/image';\nimport Link from 'next/link';");
}

const replacement = `
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800">
                  <ShoppingCart className="h-4 w-4" />
                  اطلب الآن
                </button>
                <Link href={\`/enha-lak/product/\${product.slug}\`} className="mt-3 flex w-full items-center justify-center rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
                  عرض تفاصيل المنتج
                </Link>
`;

content = content.replace(
  '<button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800">\n                  <ShoppingCart className="h-4 w-4" />\n                  اطلب الآن\n                </button>',
  replacement
);

fs.writeFileSync('src/app/enha-lak/custom/page.tsx', content, 'utf8');
console.log('Custom page updated.');
