const fs = require('fs');
let code = fs.readFileSync('src/data/domains/writing.ts', 'utf8');

code = code.replace(
`  return data.map((bkg: any) => ({
    id: bkg.id,
    packageId: bkg.package_id,
    instructorId: bkg.instructor_id,
    courseSubscriptionId: bkg.course_subscription_id,
    status: bkg.status as any,
    scheduledAt: bkg.scheduled_at,
    createdAt: bkg.created_at
  }));`,
`  return data.map((bkg: any) => ({
    id: bkg.id,
    packageId: bkg.package_id,
    userId: bkg.user_id,
    participantType: bkg.participant_type || 'self',
    childId: bkg.child_id,
    instructorId: bkg.instructor_id,
    courseSubscriptionId: bkg.course_subscription_id,
    status: bkg.status as any,
    scheduledAt: bkg.scheduled_at,
    createdAt: bkg.created_at
  }));`);
  
fs.writeFileSync('src/data/domains/writing.ts', code);
