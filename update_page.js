const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Empty the testimonials array
content = content.replace(/const testimonials = \[[^]*?\];/, 'const testimonials: any[] = [];');

// 2. Add empty states for topInstructors
content = content.replace(
  /\{topInstructors\.map\(\(instructor: any\) => \(/,
  `{topInstructors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">قريبًا</div>
        ) : topInstructors.map((instructor: any) => (`
);

// 3. Add empty states for activePublishers
content = content.replace(
  /\{activePublishers\.map\(\(publisher: any\) => \(/,
  `{activePublishers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">قريبًا</div>
        ) : activePublishers.map((publisher: any) => (`
);

// 4. Add empty states for testimonials
content = content.replace(
  /\{testimonials\.map\(\(testimonial\) => \(/,
  `{testimonials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">قريبًا</div>
        ) : testimonials.map((testimonial) => (`
);

fs.writeFileSync('src/app/page.tsx', content);
