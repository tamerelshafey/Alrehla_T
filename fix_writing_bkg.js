const fs = require('fs');
let code = fs.readFileSync('src/data/domains/writing.ts', 'utf8');

code = code.replace(
`  return data.map((bkg: any) => ({
    id: bkg.id,
    
    
    packageId: bkg.package_id,
    instructorId: bkg.instructor_id || undefined,
    courseSubscriptionId: bkg.course_subscription_id || undefined,
    status: bkg.status,
    scheduledAt: bkg.scheduled_at,
    createdAt: bkg.created_at
  }));`,
`  return data.map((bkg: any) => ({
    id: bkg.id,
    userId: bkg.user_id || 'unknown',
    participantType: bkg.participant_type || 'self',
    childId: bkg.child_id || undefined,
    packageId: bkg.package_id,
    instructorId: bkg.instructor_id || undefined,
    courseSubscriptionId: bkg.course_subscription_id || undefined,
    status: bkg.status,
    scheduledAt: bkg.scheduled_at,
    createdAt: bkg.created_at
  }));`);
  
fs.writeFileSync('src/data/domains/writing.ts', code);
