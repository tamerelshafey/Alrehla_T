const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/instructor/page.tsx', 'utf8');

if (!content.includes('<Wallet')) {
  content = content.replace("import { Users, Calendar, Video, Clock } from 'lucide-react';", "import { Users, Calendar, Video, Clock, Wallet } from 'lucide-react';");
  
  content = content.replace(
    '<h1 className="mb-8 text-3xl font-black text-slate-900">\n        مرحباً أستاذ(ة)، {user.fullName}\n      </h1>',
    `<div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-slate-900">
          مرحباً أستاذ(ة)، {user.fullName}
        </h1>
        <Link href="/dashboard/instructor/payouts" className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-md transition-colors hover:bg-slate-800">
          <Wallet className="h-4 w-4" /> المستحقات المالية
        </Link>
      </div>`
  );

  fs.writeFileSync('src/app/dashboard/instructor/page.tsx', content, 'utf8');
}
console.log('Instructor dashboard updated.');
