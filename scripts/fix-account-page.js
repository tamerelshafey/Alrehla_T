const fs = require('fs');
const content = fs.readFileSync('src/app/account/page.tsx', 'utf-8');

const newLinks = `              <Link href="/account/subscriptions/course" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <BookOpen className="h-5 w-5" />
                <span>باقات بداية الرحلة</span>
              </Link>
              <Link href="/account/bookings" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <Clock className="h-5 w-5" />
                <span>المواعيد والجلسات</span>
              </Link>
              <Link href="/account/notifications" className="flex items-center gap-3 rounded-xl hover:bg-slate-50 text-slate-600 px-4 py-3 font-bold transition-colors">
                <Bell className="h-5 w-5" />
                <span>الإشعارات</span>
              </Link>`;

const updated = content.replace(
  /<Link href="\/account\/settings".*?<\/Link>/s,
  newLinks
);

fs.writeFileSync('src/app/account/page.tsx', updated);
