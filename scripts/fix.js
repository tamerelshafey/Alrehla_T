const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/admin/instructors/InstructorsClient.tsx', 'utf8');

code = code.replace('statusDisplay', 'statusDisplay,\n      specialtiesDisplay: inst.specialties.join("، "),\n      rating: "5.0"');
fs.writeFileSync('src/app/dashboard/admin/instructors/InstructorsClient.tsx', code);
