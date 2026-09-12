const fs = require('fs');
const glob = require('glob'); // wait, glob is not available, I will just use sed or string replace

// files to patch: 
// src/app/dashboard/admin/subscriptions/courses/page.tsx
// src/app/dashboard/admin/bookings/calendar/page.tsx
// src/app/dashboard/admin/bookings/[id]/page.tsx
// src/app/dashboard/admin/page.tsx
// src/app/dashboard/instructor/sessions/[id]/InstructorSessionClient.tsx
// src/app/dashboard/instructor/page.tsx
// src/data/domains/orders.ts

function patchFile(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace dependentParticipantId, independentParticipantId accesses with fallback logic
  code = code.replace(/s\.dependentParticipantId,\s*s\.independentParticipantId/g, "s.childId, s.userId");
  code = code.replace(/b\.dependentParticipantId,\s*b\.independentParticipantId/g, "b.childId || b.userId, b.userId");
  code = code.replace(/target\?\.independentParticipantId/g, "target?.userId");
  code = code.replace(/booking\?\.independentParticipantId\s*\|\|\s*booking\?\.dependentParticipantId/g, "booking?.childId || booking?.userId");
  code = code.replace(/session\.independentParticipantId\s*\|\|\s*session\.dependentParticipantId/g, "session.childId || session.userId");
  code = code.replace(/b\?\.independentParticipantId/g, "b?.userId");
  code = code.replace(/session\?\.independentParticipantId\s*\|\|\s*session\?\.dependentParticipantId/g, "session?.childId || session?.userId");
  
  fs.writeFileSync(file, code);
}

patchFile('src/app/dashboard/admin/subscriptions/courses/page.tsx');
patchFile('src/app/dashboard/admin/bookings/calendar/page.tsx');
patchFile('src/app/dashboard/admin/bookings/[id]/page.tsx');
patchFile('src/app/dashboard/admin/page.tsx');
patchFile('src/app/dashboard/instructor/sessions/[id]/InstructorSessionClient.tsx');
patchFile('src/app/dashboard/instructor/page.tsx');
