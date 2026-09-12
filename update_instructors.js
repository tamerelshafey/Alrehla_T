const fs = require('fs');

let content = fs.readFileSync('src/app/creative-writing/instructors/page.tsx', 'utf8');

content = content.replace(
  /\{instructors\.map\(\(instructor\) => \(/,
  `{instructors.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 font-medium text-lg">قريبًا</div>
        ) : instructors.map((instructor) => (`
);

fs.writeFileSync('src/app/creative-writing/instructors/page.tsx', content);
