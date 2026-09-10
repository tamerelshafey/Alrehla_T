const fs = require('fs');

const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add imports for mock data and components
content = content.replace(
  "import { Button } from '@/components/Button';",
  "import { Button } from '@/components/Button';\nimport { getPublishers } from '@/data/domains/products';\nimport { getInstructors } from '@/data/domains/writing';"
);

// Convert default export to async
content = content.replace(
  "export default function HomePage() {",
  "export default async function HomePage() {\n  const publishers = await getPublishers();\n  const activePublishers = publishers.filter(p => p.status === 'active').slice(0, 4);\n  const instructors = await getInstructors();\n  const topInstructors = instructors.filter(i => i.status === 'active').slice(0, 4);"
);

// Add the new sections right before the "قصتنا" section
const newSections = `
      {/* Featured Instructors */}
      <Section className="bg-slate-50 border-y border-slate-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">مدربون متميزون</h2>
            <p className="text-slate-500 font-medium max-w-2xl">نخبة من المدربين المتخصصين في الكتابة الإبداعية وتطوير مهارات السرد.</p>
          </div>
          <Button href="/creative-writing" variant="secondary" className="w-full md:w-auto">عرض جميع المدربين</Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topInstructors.map(instructor => (
            <div key={instructor.id} className="group relative rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 relative h-24 w-24 overflow-hidden rounded-full border-4 border-emerald-50">
                  <Image 
                    src={instructor.avatarUrl || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(instructor.displayName)}&background=10b981&color=fff\`} 
                    alt={instructor.displayName} 
                    fill className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{instructor.displayName}</h3>
                <p className="text-sm font-medium text-slate-500 mb-4 line-clamp-2">{instructor.bio}</p>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-bold">
                  ★ {instructor.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Featured Publishers */}
      <Section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">شركاء "إنها لك"</h2>
            <p className="text-slate-500 font-medium max-w-2xl">دور نشر ومؤسسات إبداعية تقدم محتوى متميزاً قابل للتخصيص.</p>
          </div>
          <Button href="/enha-lak" variant="secondary" className="w-full md:w-auto">استكشف المكتبة</Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activePublishers.map(publisher => (
            <Link href={\`/enha-lak/publisher/\${publisher.slug}\`} key={publisher.id} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col items-center text-center">
              <div className="mb-4 relative h-20 w-20 flex items-center justify-center">
                {publisher.logoUrl ? (
                  <Image 
                    src={publisher.logoUrl} 
                    alt={publisher.name} 
                    fill className="object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center font-black text-xl">
                    {publisher.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{publisher.name}</h3>
              <p className="text-sm font-medium text-slate-500 line-clamp-2">{publisher.bio}</p>
            </Link>
          ))}
        </div>
      </Section>
`;

content = content.replace(
  "{/* Our Story */}",
  newSections + "\n      {/* Our Story */}"
);

fs.writeFileSync(path, content);
